import Constants from 'expo-constants';
import { AIPresetResult, AIRecommendedSound, Frequency } from '@/types';
import { sounds, validSoundIds } from '@/data/sounds';
import { AI_API_TIMEOUT, AI_MAX_INPUT_LENGTH } from '@/utils/constants';
import { useSleepStore } from '@/stores/useSleepStore';
import { buildSleepContext } from '@/services/SleepCoachingService';

// ──────────────────────────────────────────────
// System prompt
// ──────────────────────────────────────────────

const ALL_SOUND_IDS = sounds.map((s) => s.id).join(', ');

const SYSTEM_PROMPT = `당신은 수면/휴식 사운드 전문가입니다. 사용자의 기분이나 상황 설명을 바탕으로 최적의 자연 소리 조합을 추천해주세요.
사용자의 수면 데이터가 제공되면, 해당 데이터를 참고하여 더 개인화된 추천을 해주세요.

사용 가능한 소리 ID 목록: [${ALL_SOUND_IDS}]

반드시 아래 JSON 형식으로만 응답하십시오. 다른 텍스트는 포함하지 마십시오.
{
  "preset_name": "프리셋 이름 (이모지 포함, 20자 이내)",
  "description": "한 줄 설명 (30자 이내)",
  "sounds": [
    {
      "soundId": "소리 ID",
      "volumeMin": 0~100,
      "volumeMax": 0~100,
      "frequency": "continuous|frequent|occasional|rare"
    }
  ]
}

규칙:
- sounds 배열은 최소 2개, 최대 8개.
- volumeMin은 반드시 volumeMax 이하.
- 무료/유료 구분 없이 모든 소리 사용 가능 (프리미엄 전용 기능이므로).
- frequency는 소리의 type이 "continuous"이면 반드시 "continuous"로 설정.
- 사용자 입력과 무관한 부적절한 내용 요청 시, 기본 수면 프리셋을 반환.`;

// ──────────────────────────────────────────────
// API key
// ──────────────────────────────────────────────

function getApiKey(): string {
  return (Constants.expoConfig?.extra?.GEMINI_API_KEY as string) ?? '';
}

// ──────────────────────────────────────────────
// Validation helpers
// ──────────────────────────────────────────────

const VALID_FREQUENCIES = new Set<string>(['continuous', 'frequent', 'occasional', 'rare']);

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function validateResponse(raw: unknown): AIPresetResult | null {
  if (!raw || typeof raw !== 'object') return null;

  const obj = raw as Record<string, unknown>;

  // 1. preset_name & description
  const preset_name =
    typeof obj.preset_name === 'string' ? obj.preset_name.slice(0, 20) : '✨ AI 추천';
  const description =
    typeof obj.description === 'string' ? obj.description.slice(0, 30) : 'AI가 추천한 프리셋';

  // 2. sounds array
  if (!Array.isArray(obj.sounds) || obj.sounds.length < 2) return null;

  const validatedSounds: AIRecommendedSound[] = [];

  for (const s of obj.sounds.slice(0, 8)) {
    if (!s || typeof s !== 'object') continue;
    const item = s as Record<string, unknown>;

    // soundId 존재 확인
    const soundId = String(item.soundId ?? '');
    if (!validSoundIds.has(soundId)) continue;

    // volumeMin / volumeMax
    let volMin = typeof item.volumeMin === 'number' ? item.volumeMin : 30;
    let volMax = typeof item.volumeMax === 'number' ? item.volumeMax : 70;

    // min > max 이면 스왑
    if (volMin > volMax) [volMin, volMax] = [volMax, volMin];

    volMin = clamp(volMin, 0, 100);
    volMax = clamp(volMax, 0, 100);

    // frequency
    let frequency: Frequency = 'continuous';
    if (typeof item.frequency === 'string' && VALID_FREQUENCIES.has(item.frequency)) {
      frequency = item.frequency as Frequency;
    }

    // 연속 소리에 잘못된 frequency 설정 → continuous로 강제
    const soundMeta = sounds.find((sm) => sm.id === soundId);
    if (soundMeta?.type === 'continuous') {
      frequency = 'continuous';
    }

    validatedSounds.push({ soundId, volumeMin: volMin, volumeMax: volMax, frequency });
  }

  if (validatedSounds.length < 2) return null;

  return { preset_name, description, sounds: validatedSounds };
}

// ──────────────────────────────────────────────
// Public API
// ──────────────────────────────────────────────

export async function recommend(userInput: string): Promise<AIPresetResult> {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('API key not configured');

  // 입력 길이 제한 (프롬프트 인젝션 방지 + 비용 절감)
  const sleepContext = buildSleepContext(useSleepStore.getState().records);
  const sanitizedInput = userInput.trim().slice(0, AI_MAX_INPUT_LENGTH) + sleepContext;
  if (sanitizedInput.length === 0) throw new Error('입력이 비어있습니다');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AI_API_TIMEOUT);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: sanitizedInput }] }],
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.7,
            maxOutputTokens: 1024,
          },
        }),
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    // Gemini 응답에서 텍스트 추출
    const text: string =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    // JSON 파싱
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error('AI 응답을 파싱할 수 없습니다');
    }

    // 유효성 검증
    const result = validateResponse(parsed);
    if (!result) {
      throw new Error('AI 응답이 유효하지 않습니다');
    }

    return result;
  } finally {
    clearTimeout(timeout);
  }
}
