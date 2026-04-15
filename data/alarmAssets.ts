import { AVPlaybackSource } from 'expo-av';

/**
 * 기본 알람 소리 에셋 정적 require() 맵.
 * Metro 번들러는 동적 require()를 지원하지 않으므로 정적 참조가 필수.
 */
const alarmAssets: Record<string, AVPlaybackSource> = {
  'alarm-default': require('@/assets/sounds/alarm-default.mp3'),
  'alarm-classic': require('@/assets/sounds/alarm-classic.mp3'),
  'alarm-gentle':  require('@/assets/sounds/alarm-gentle.mp3'),
  'alarm-birds':   require('@/assets/sounds/alarm-birds.mp3'),
  'alarm-melody':  require('@/assets/sounds/alarm-melody.mp3'),
};

export default alarmAssets;
