import { MathProblem, MathDifficulty } from '@/types';

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateMathProblem(difficulty: MathDifficulty): MathProblem {
  switch (difficulty) {
    case 'easy': {
      const a = randInt(1, 9);
      const b = randInt(1, 9);
      const op = Math.random() < 0.5 ? '+' : '-';
      if (op === '-' && a < b) {
        return { question: `${b} − ${a} = ?`, answer: b - a };
      }
      return op === '+'
        ? { question: `${a} + ${b} = ?`, answer: a + b }
        : { question: `${a} − ${b} = ?`, answer: a - b };
    }
    case 'medium': {
      const a = randInt(10, 99);
      const b = randInt(10, 99);
      const op = Math.random() < 0.5 ? '+' : '-';
      if (op === '-' && a < b) {
        return { question: `${b} − ${a} = ?`, answer: b - a };
      }
      return op === '+'
        ? { question: `${a} + ${b} = ?`, answer: a + b }
        : { question: `${a} − ${b} = ?`, answer: a - b };
    }
    case 'hard': {
      if (Math.random() < 0.5) {
        // 두 자리 × 한 자리
        const a = randInt(10, 99);
        const b = randInt(2, 9);
        return { question: `${a} × ${b} = ?`, answer: a * b };
      } else {
        // 세 자리 + 세 자리
        const a = randInt(100, 999);
        const b = randInt(100, 999);
        return { question: `${a} + ${b} = ?`, answer: a + b };
      }
    }
  }
}
