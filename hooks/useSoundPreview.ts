import { useSyncExternalStore, useCallback } from 'react';
import {
  subscribePreview,
  getPreviewingSoundId,
  startPreview,
  stopPreview,
} from '@/services/SoundPreview';

export function useSoundPreview() {
  const previewingSoundId = useSyncExternalStore(subscribePreview, getPreviewingSoundId);

  const togglePreview = useCallback(async (soundId: string) => {
    await startPreview(soundId);
  }, []);

  return { previewingSoundId, togglePreview, stopPreview };
}
