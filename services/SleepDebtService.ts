/**
 * SleepDebtService — 수면 부채 계산 엔진
 *
 * 14일 윈도우 기반 수면 부채 추적
 * - 개인별 수면 목표(기본 8시간) 대비 실제 수면 부족분 누적
 * - 과수면(10시간+) 시 회복 상한선 적용: 하루 최대 2시간 회복
 * - 부채 0 미만 클램핑 (수면 저축 개념 없음)
 */

import { DailyDebtRecord, DebtTrend } from '@/types';

const DEBT_WINDOW_DAYS = 14;
const MAX_RECOVERY_PER_DAY_MIN = 120; // 하루 최대 2시간 회복

export interface SleepDebtState {
  targetSleepMinutes: number;
  dailyRecords: DailyDebtRecord[];
  currentDebtMinutes: number;
  debtTrend: DebtTrend;
}

export function calculateSleepDebt(
  sleepRecords: Array<{ date: string; tst: number }>,
  targetSleepMinutes: number,
): SleepDebtState {
  // 최근 14일 날짜 생성
  const today = new Date();
  const dates: string[] = [];
  for (let i = DEBT_WINDOW_DAYS - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }

  // 날짜별 실제 수면 시간 매핑
  const sleepMap = new Map<string, number>();
  for (const rec of sleepRecords) {
    // 같은 날 여러 기록이 있으면 합산
    sleepMap.set(rec.date, (sleepMap.get(rec.date) ?? 0) + rec.tst);
  }

  const dailyRecords: DailyDebtRecord[] = [];
  let totalDebt = 0;

  for (const date of dates) {
    const actual = sleepMap.get(date);
    if (actual === undefined) {
      // 데이터 없는 날은 부채 계산에서 제외
      dailyRecords.push({ date, actualSleepMinutes: 0, debtChangeMinutes: 0 });
      continue;
    }

    let debtChange = targetSleepMinutes - actual;

    // 과수면 회복 상한선 적용
    if (debtChange < 0) {
      debtChange = Math.max(-MAX_RECOVERY_PER_DAY_MIN, debtChange);
    }

    totalDebt += debtChange;
    dailyRecords.push({
      date,
      actualSleepMinutes: actual,
      debtChangeMinutes: debtChange,
    });
  }

  const currentDebtMinutes = Math.max(0, totalDebt);

  // 트렌드 계산: 최근 3일 vs 이전 3일
  const recent3 = dailyRecords.slice(-3);
  const prev3 = dailyRecords.slice(-6, -3);

  const recentAvgDebt = recent3.reduce((s, r) => s + r.debtChangeMinutes, 0) / Math.max(1, recent3.length);
  const prevAvgDebt = prev3.reduce((s, r) => s + r.debtChangeMinutes, 0) / Math.max(1, prev3.length);

  let debtTrend: DebtTrend = 'stable';
  if (recentAvgDebt > prevAvgDebt + 10) {
    debtTrend = 'increasing';
  } else if (recentAvgDebt < prevAvgDebt - 10) {
    debtTrend = 'decreasing';
  }

  return {
    targetSleepMinutes,
    dailyRecords,
    currentDebtMinutes,
    debtTrend,
  };
}

export function generateRecoverySuggestion(
  debtMinutes: number,
  targetSleepMinutes: number,
): string | null {
  if (debtMinutes <= 0) return null;

  const debtHours = debtMinutes / 60;

  if (debtHours <= 1) {
    const extraMin = Math.ceil(debtMinutes / 3);
    return `sleepDebt.recoverySoon:${extraMin}`;
  }

  if (debtHours <= 3) {
    const extraMin = Math.ceil(debtMinutes / 7);
    return `sleepDebt.recoveryWeek:${extraMin}`;
  }

  return `sleepDebt.recoveryGradual`;
}

export function getDebtScore(debtMinutes: number): number {
  if (debtMinutes <= 0) return 100;
  if (debtMinutes <= 60) return 75;
  if (debtMinutes <= 120) return 50;
  return 25;
}
