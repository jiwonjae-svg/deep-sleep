import { SleepRecord } from '@/stores/useSleepStore';
import { sounds } from '@/data/sounds';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export type CoachingTipType = 'bedtime' | 'duration' | 'sound' | 'consistency' | 'trend' | 'noise' | 'general';

export interface CoachingTip {
  id: string;
  type: CoachingTipType;
  icon: string; // MaterialIcons name
  titleKey: string; // i18n key
  messageKey: string; // i18n key
  messageParams?: Record<string, string | number>;
  priority: number; // higher = show first
}

export interface SleepPattern {
  optimalBedtime: { hour: number; minute: number } | null;
  optimalDuration: number | null; // minutes
  bestSoundIds: string[];
  avgScore7d: number | null;
  avgScore30d: number | null;
  scoreTrend: 'improving' | 'declining' | 'stable' | null;
  consistencyRating: 'good' | 'fair' | 'poor' | null;
  avgBedtimeHour: number | null;
}

// ──────────────────────────────────────────────
// Pattern Analysis
// ──────────────────────────────────────────────

export function analyzeSleepPattern(records: SleepRecord[]): SleepPattern {
  const result: SleepPattern = {
    optimalBedtime: null,
    optimalDuration: null,
    bestSoundIds: [],
    avgScore7d: null,
    avgScore30d: null,
    scoreTrend: null,
    consistencyRating: null,
    avgBedtimeHour: null,
  };

  if (records.length < 3) return result;

  const now = Date.now();
  const last7d = records.filter((r) => now - r.trackingStart < 7 * 86400000);
  const last30d = records.filter((r) => now - r.trackingStart < 30 * 86400000);

  // Average scores
  if (last7d.length > 0) {
    result.avgScore7d = Math.round(last7d.reduce((s, r) => s + r.score, 0) / last7d.length);
  }
  if (last30d.length > 0) {
    result.avgScore30d = Math.round(last30d.reduce((s, r) => s + r.score, 0) / last30d.length);
  }

  // Trend: compare first half vs second half of last 14 days
  const last14d = records.filter((r) => now - r.trackingStart < 14 * 86400000);
  if (last14d.length >= 6) {
    const mid = Math.floor(last14d.length / 2);
    const recentHalf = last14d.slice(0, mid);
    const olderHalf = last14d.slice(mid);
    const recentAvg = recentHalf.reduce((s, r) => s + r.score, 0) / recentHalf.length;
    const olderAvg = olderHalf.reduce((s, r) => s + r.score, 0) / olderHalf.length;
    const diff = recentAvg - olderAvg;
    if (diff > 5) result.scoreTrend = 'improving';
    else if (diff < -5) result.scoreTrend = 'declining';
    else result.scoreTrend = 'stable';
  }

  // Optimal bedtime: find bedtime hour with highest avg score
  const bedtimeScores = new Map<number, { total: number; count: number }>();
  for (const r of last30d) {
    const d = new Date(r.trackingStart);
    // Normalize: if past midnight, treat as previous day's bedtime
    let hour = d.getHours();
    if (hour < 6) hour += 24; // e.g., 1am → 25
    const bucket = hour; // hourly bucket
    const existing = bedtimeScores.get(bucket) ?? { total: 0, count: 0 };
    existing.total += r.score;
    existing.count++;
    bedtimeScores.set(bucket, existing);
  }

  let bestHour = -1;
  let bestAvg = 0;
  bedtimeScores.forEach((val, hour) => {
    if (val.count >= 2) {
      const avg = val.total / val.count;
      if (avg > bestAvg) {
        bestAvg = avg;
        bestHour = hour;
      }
    }
  });

  if (bestHour >= 0) {
    const h = bestHour >= 24 ? bestHour - 24 : bestHour;
    result.optimalBedtime = { hour: h, minute: 0 };
  }

  // Average bedtime
  if (last7d.length > 0) {
    const bedtimeMinutes = last7d.map((r) => {
      const d = new Date(r.trackingStart);
      let m = d.getHours() * 60 + d.getMinutes();
      if (m < 360) m += 1440; // before 6am → add 24h
      return m;
    });
    const avgMin = Math.round(bedtimeMinutes.reduce((a, b) => a + b, 0) / bedtimeMinutes.length);
    const normalizedMin = avgMin >= 1440 ? avgMin - 1440 : avgMin;
    result.avgBedtimeHour = normalizedMin / 60;
  }

  // Consistency rating
  if (last7d.length >= 3) {
    const bedtimeMinutes = last7d.map((r) => {
      const d = new Date(r.trackingStart);
      let m = d.getHours() * 60 + d.getMinutes();
      if (m < 360) m += 1440;
      return m;
    });
    const mean = bedtimeMinutes.reduce((a, b) => a + b, 0) / bedtimeMinutes.length;
    const variance = bedtimeMinutes.reduce((s, v) => s + (v - mean) ** 2, 0) / bedtimeMinutes.length;
    const std = Math.sqrt(variance);
    if (std < 30) result.consistencyRating = 'good';
    else if (std < 60) result.consistencyRating = 'fair';
    else result.consistencyRating = 'poor';
  }

  // Optimal duration: find TST range with highest scores
  const goodRecords = last30d.filter((r) => r.score >= 75);
  if (goodRecords.length >= 3) {
    result.optimalDuration = Math.round(
      goodRecords.reduce((s, r) => s + r.tst, 0) / goodRecords.length,
    );
  }

  // Best sounds: score-weighted ranking
  const soundScoreMap = new Map<string, { total: number; count: number }>();
  for (const r of last30d) {
    if (r.soundsPlayed) {
      for (const sid of r.soundsPlayed) {
        const existing = soundScoreMap.get(sid) ?? { total: 0, count: 0 };
        existing.total += r.score;
        existing.count++;
        soundScoreMap.set(sid, existing);
      }
    }
  }
  const soundRanking = Array.from(soundScoreMap.entries())
    .filter(([, v]) => v.count >= 2)
    .map(([id, v]) => ({ id, avg: v.total / v.count }))
    .sort((a, b) => b.avg - a.avg);
  result.bestSoundIds = soundRanking.slice(0, 3).map((s) => s.id);

  return result;
}

// ──────────────────────────────────────────────
// Coaching Tips Generation
// ──────────────────────────────────────────────

export function generateCoachingTips(
  records: SleepRecord[],
  pattern: SleepPattern,
): CoachingTip[] {
  const tips: CoachingTip[] = [];

  if (records.length < 3) {
    tips.push({
      id: 'need-data',
      type: 'general',
      icon: 'auto-awesome',
      titleKey: 'coaching.needDataTitle',
      messageKey: 'coaching.needDataMsg',
      priority: 100,
    });
    return tips;
  }

  const latest = records[0];

  // 1. Bedtime consistency tip
  if (pattern.consistencyRating === 'poor') {
    tips.push({
      id: 'consistency-poor',
      type: 'consistency',
      icon: 'schedule',
      titleKey: 'coaching.consistencyTitle',
      messageKey: 'coaching.consistencyPoor',
      priority: 90,
    });
  } else if (pattern.consistencyRating === 'fair') {
    tips.push({
      id: 'consistency-fair',
      type: 'consistency',
      icon: 'schedule',
      titleKey: 'coaching.consistencyTitle',
      messageKey: 'coaching.consistencyFair',
      priority: 60,
    });
  } else if (pattern.consistencyRating === 'good') {
    tips.push({
      id: 'consistency-good',
      type: 'consistency',
      icon: 'verified',
      titleKey: 'coaching.consistencyTitle',
      messageKey: 'coaching.consistencyGood',
      priority: 30,
    });
  }

  // 2. Optimal bedtime recommendation
  if (pattern.optimalBedtime) {
    const { hour, minute } = pattern.optimalBedtime;
    const timeStr = `${hour}:${String(minute).padStart(2, '0')}`;
    tips.push({
      id: 'optimal-bedtime',
      type: 'bedtime',
      icon: 'bedtime',
      titleKey: 'coaching.bedtimeTitle',
      messageKey: 'coaching.bedtimeMsg',
      messageParams: { time: timeStr },
      priority: 80,
    });
  }

  // 3. Duration tip
  if (pattern.optimalDuration) {
    const h = Math.floor(pattern.optimalDuration / 60);
    const m = pattern.optimalDuration % 60;
    const durStr = m > 0 ? `${h}h ${m}m` : `${h}h`;
    tips.push({
      id: 'optimal-duration',
      type: 'duration',
      icon: 'timer',
      titleKey: 'coaching.durationTitle',
      messageKey: 'coaching.durationMsg',
      messageParams: { duration: durStr },
      priority: 70,
    });
  }

  // 4. Trend feedback
  if (pattern.scoreTrend === 'improving') {
    tips.push({
      id: 'trend-up',
      type: 'trend',
      icon: 'trending-up',
      titleKey: 'coaching.trendTitle',
      messageKey: 'coaching.trendImproving',
      priority: 85,
    });
  } else if (pattern.scoreTrend === 'declining') {
    tips.push({
      id: 'trend-down',
      type: 'trend',
      icon: 'trending-down',
      titleKey: 'coaching.trendTitle',
      messageKey: 'coaching.trendDeclining',
      priority: 95,
    });
  }

  // 5. Sound recommendation based on data
  if (pattern.bestSoundIds.length > 0) {
    const topSoundName = sounds.find((s) => s.id === pattern.bestSoundIds[0])?.name ?? pattern.bestSoundIds[0];
    tips.push({
      id: 'best-sound',
      type: 'sound',
      icon: 'music-note',
      titleKey: 'coaching.soundTitle',
      messageKey: 'coaching.soundMsg',
      messageParams: { soundName: topSoundName, soundId: pattern.bestSoundIds[0] },
      priority: 65,
    });
  }

  // 6. Noise awareness
  const recentWithNoise = records.slice(0, 7).filter((r) => r.noiseEvents && r.noiseEvents.length > 3);
  if (recentWithNoise.length >= 2) {
    tips.push({
      id: 'noise-warning',
      type: 'noise',
      icon: 'volume-up',
      titleKey: 'coaching.noiseTitle',
      messageKey: 'coaching.noiseMsg',
      priority: 75,
    });
  }

  // 7. Low score on latest record
  if (latest.score < 60) {
    tips.push({
      id: 'low-score',
      type: 'general',
      icon: 'nights-stay',
      titleKey: 'coaching.lowScoreTitle',
      messageKey: 'coaching.lowScoreMsg',
      priority: 88,
    });
  }

  // Sort by priority descending
  tips.sort((a, b) => b.priority - a.priority);

  return tips.slice(0, 4); // Return top 4 tips
}

// ──────────────────────────────────────────────
// Sound Recommendation Enhancement
// ──────────────────────────────────────────────

/**
 * Build a sleep-data-aware context string to append to AI prompt.
 * This helps the AI make better recommendations based on actual user data.
 */
export function buildSleepContext(records: SleepRecord[]): string {
  const pattern = analyzeSleepPattern(records);
  const parts: string[] = [];

  if (pattern.avgScore7d !== null) {
    parts.push(`최근 7일 평균 수면 점수: ${pattern.avgScore7d}점`);
  }

  if (pattern.optimalDuration) {
    const h = Math.floor(pattern.optimalDuration / 60);
    const m = pattern.optimalDuration % 60;
    parts.push(`최적 수면 시간: ${h}시간 ${m > 0 ? m + '분' : ''}`);
  }

  if (pattern.bestSoundIds.length > 0) {
    const soundNames = pattern.bestSoundIds
      .map((id) => sounds.find((s) => s.id === id)?.name ?? id)
      .join(', ');
    parts.push(`효과 좋았던 사운드: ${soundNames}`);
  }

  if (pattern.scoreTrend) {
    const trendMap = {
      improving: '개선 중',
      declining: '하락 중',
      stable: '안정적',
    };
    parts.push(`수면 추세: ${trendMap[pattern.scoreTrend]}`);
  }

  if (parts.length === 0) return '';

  return `\n\n[사용자 수면 데이터]\n${parts.join('\n')}`;
}

// ──────────────────────────────────────────────
// Monthly Report
// ──────────────────────────────────────────────

export interface MonthlyReport {
  month: string; // YYYY-MM
  totalNights: number;
  avgScore: number;
  avgTst: number;
  avgSe: number;
  bestDay: { date: string; score: number } | null;
  worstDay: { date: string; score: number } | null;
  scoreChange: number | null; // vs previous month
  topSoundId: string | null;
}

export function generateMonthlyReport(records: SleepRecord[]): MonthlyReport | null {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const monthRecords = records.filter((r) => r.date.startsWith(currentMonth));
  if (monthRecords.length < 3) return null;

  const avgScore = Math.round(monthRecords.reduce((s, r) => s + r.score, 0) / monthRecords.length);
  const avgTst = Math.round(monthRecords.reduce((s, r) => s + r.tst, 0) / monthRecords.length);
  const avgSe = Math.round(monthRecords.reduce((s, r) => s + r.se, 0) / monthRecords.length);

  const sorted = [...monthRecords].sort((a, b) => b.score - a.score);
  const bestDay = sorted.length > 0 ? { date: sorted[0].date, score: sorted[0].score } : null;
  const worstDay = sorted.length > 0
    ? { date: sorted[sorted.length - 1].date, score: sorted[sorted.length - 1].score }
    : null;

  // Previous month comparison
  const prevMonth = now.getMonth() === 0
    ? `${now.getFullYear() - 1}-12`
    : `${now.getFullYear()}-${String(now.getMonth()).padStart(2, '0')}`;
  const prevRecords = records.filter((r) => r.date.startsWith(prevMonth));
  const scoreChange = prevRecords.length >= 3
    ? avgScore - Math.round(prevRecords.reduce((s, r) => s + r.score, 0) / prevRecords.length)
    : null;

  // Top sound
  const soundMap = new Map<string, number>();
  for (const r of monthRecords) {
    if (r.soundsPlayed) {
      for (const sid of r.soundsPlayed) {
        soundMap.set(sid, (soundMap.get(sid) ?? 0) + 1);
      }
    }
  }
  let topSoundId: string | null = null;
  let topCount = 0;
  soundMap.forEach((count, id) => {
    if (count > topCount) {
      topCount = count;
      topSoundId = id;
    }
  });

  return {
    month: currentMonth,
    totalNights: monthRecords.length,
    avgScore,
    avgTst,
    avgSe,
    bestDay,
    worstDay,
    scoreChange,
    topSoundId,
  };
}
