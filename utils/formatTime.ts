/**
 * 시간 포맷 유틸리티.
 */

/** 남은 시간을 "X시간 Y분" 형태로 반환 */
export function formatRemainingTime(ms: number): string {
  if (ms <= 0) return '0분';
  const totalMin = Math.ceil(ms / 60_000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h > 0 && m > 0) return `${h}시간 ${m}분`;
  if (h > 0) return `${h}시간`;
  return `${m}분`;
}

/** 남은 시간을 간략하게 "n일 뒤" / "n개월 뒤" / "n년 뒤" 형태로 반환 */
export function formatRemainingTimeLong(ms: number): string {
  if (ms <= 0) return '0분';
  const totalMin = Math.ceil(ms / 60_000);
  const totalHours = Math.floor(totalMin / 60);
  const totalDays = Math.floor(totalHours / 24);

  if (totalDays >= 365) {
    const years = Math.floor(totalDays / 365);
    return `${years}년`;
  }
  if (totalDays >= 30) {
    const months = Math.floor(totalDays / 30);
    return `${months}개월`;
  }
  if (totalDays >= 1) {
    return `${totalDays}일`;
  }
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h > 0 && m > 0) return `${h}시간 ${m}분`;
  if (h > 0) return `${h}시간`;
  return `${m}분`;
}

/** 정밀한 타이머 표시: h:mm 또는 m:ss 형태 */
export function formatTimerPrecise(ms: number): { left: string; right: string } {
  if (ms <= 0) return { left: '00', right: '00' };
  const totalSec = Math.ceil(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) {
    return { left: String(h), right: String(m).padStart(2, '0') };
  }
  return { left: String(m), right: String(s).padStart(2, '0') };
}

/** 시:분 을 "HH:MM" 형태로 반환 */
export function formatTimeHHMM(hour: number, minute: number): string {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

/** 현재 시각을 HH:MM:SS 문자열로 반환 */
export function getCurrentTimeString(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
}

/** 다음 알람까지 남은 시간 계산 (ms) */
export function msUntilAlarm(hour: number, minute: number): number {
  const now = new Date();
  const target = new Date(now);
  target.setHours(hour, minute, 0, 0);
  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1);
  }
  return target.getTime() - now.getTime();
}

/** 요일 라벨 (한국어, 월=0) */
export const DAY_LABELS_KO = ['월', '화', '수', '목', '금', '토', '일'] as const;
export const DAY_LABELS_EN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
