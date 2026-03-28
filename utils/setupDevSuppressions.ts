/**
 * Expo Go 및 개발 환경에서 발생하는 알려진 콘솔 경고/에러를 억제한다.
 *
 * ⚠️  이 파일은 app/_layout.tsx의 "첫 번째 import"여야 한다.
 *     Babel/Metro는 모든 import를 실행 코드보다 먼저 hoit하므로,
 *     import 순서가 LogBox·console 인터셉터 설치 시점을 결정한다.
 *
 * 억제 대상:
 *  1. expo-notifications: Expo Go SDK 53+ 에서 REMOTE push token 자동 등록 시도 ERROR
 *  2. expo-av: SDK 54에서도 남아 있는 Deprecated WARN (expo-audio 마이그레이션 전까지)
 */

import { LogBox } from 'react-native';

// ── 1. LogBox 오버레이 억제 (앱 내 빨간/주황 오버레이) ──────────────
LogBox.ignoreLogs([
  // expo-notifications Expo Go push 제한
  'expo-notifications: Android Push notifications',
  '`expo-notifications` functionality is not fully supported in Expo Go',
  // expo-av 지원 중단 경고
  '[expo-av]: Expo AV has been deprecated',
  'Expo AV has been deprecated',
]);

// ── 2. console.error / console.warn 인터셉터 (Metro 터미널 출력 억제) ──
// LogBox.ignoreLogs는 앱 내 오버레이만 억제하고 Metro 서버 콘솔 출력은
// 막지 못한다. 직접 console 함수를 래핑해 Metro로 전달되기 전에 필터링한다.
if (__DEV__) {
  const SUPPRESSED_PATTERNS = [
    'expo-notifications: Android Push notifications',
    '`expo-notifications` functionality is not fully supported in Expo Go',
    '[expo-av]: Expo AV has been deprecated',
    'Expo AV has been deprecated and will be removed',
  ];

  function isSuppressed(args: unknown[]): boolean {
    const msg = String(args[0] ?? '');
    return SUPPRESSED_PATTERNS.some((p) => msg.includes(p));
  }

  const _error = console.error.bind(console);
  console.error = (...args: unknown[]) => {
    if (isSuppressed(args)) return;
    _error(...args);
  };

  const _warn = console.warn.bind(console);
  console.warn = (...args: unknown[]) => {
    if (isSuppressed(args)) return;
    _warn(...args);
  };
}
