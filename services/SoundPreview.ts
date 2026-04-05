import { Audio } from 'expo-av';
import { getSoundById } from '@/data/sounds';
import { getSoundAsset } from '@/data/soundAssets';

/**
 * Lightweight singleton for independent sound preview.
 * Manages a single Audio.Sound instance — starting a new preview
 * automatically stops the previous one.
 */

let currentSound: Audio.Sound | null = null;
let currentSoundId: string | null = null;
let listeners: Set<() => void> = new Set();

function notify() {
  listeners.forEach((fn) => fn());
}

export function subscribePreview(fn: () => void): () => void {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

export function getPreviewingSoundId(): string | null {
  return currentSoundId;
}

export async function startPreview(soundId: string): Promise<void> {
  // If same sound, stop it (toggle behavior)
  if (currentSoundId === soundId) {
    await stopPreview();
    return;
  }

  // Stop any existing preview
  await stopPreview();

  const meta = getSoundById(soundId);
  if (!meta) return;

  try {
    const source = getSoundAsset(soundId);
    if (!source) return;

    const { sound } = await Audio.Sound.createAsync(
      source,
      { shouldPlay: true, isLooping: true, volume: 0.7 },
    );

    // Listen for errors / playback ending
    sound.setOnPlaybackStatusUpdate((status) => {
      if ('isLoaded' in status && !status.isLoaded && currentSoundId === soundId) {
        currentSound = null;
        currentSoundId = null;
        notify();
      }
    });

    currentSound = sound;
    currentSoundId = soundId;
    notify();
  } catch {
    // File missing — silently ignore
  }
}

export async function stopPreview(): Promise<void> {
  if (currentSound) {
    try {
      await currentSound.stopAsync();
      await currentSound.unloadAsync();
    } catch {
      // already unloaded
    }
    currentSound = null;
    currentSoundId = null;
    notify();
  }
}
