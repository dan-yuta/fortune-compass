import { birthstones, birthstoneAdvice } from '../data/birthstone-data';
import { getDateSeed, seededChoice, seededScore } from '../utils/seed-random';

export interface BirthstoneResult {
  fortuneType: 'birthstone';
  stone: string;
  stoneEn: string;
  effect: string;
  personality: string;
  score: number;
  advice: string;
}

export function getBirthstoneFortune(birthday: string): BirthstoneResult {
  const date = new Date(birthday);
  if (isNaN(date.getTime())) {
    throw new Error('Invalid birthday format');
  }

  const month = date.getUTCMonth() + 1;
  const info = birthstones.find(b => b.month === month);
  if (!info) {
    throw new Error('Invalid month');
  }

  const dateSeed = getDateSeed();
  const baseSeed = `${dateSeed}-birthstone-${info.stoneEn}`;

  return {
    fortuneType: 'birthstone',
    stone: info.stone,
    stoneEn: info.stoneEn,
    effect: info.effect,
    personality: info.personality,
    score: seededScore(`${baseSeed}-score`),
    advice: seededChoice(`${baseSeed}-advice`, birthstoneAdvice),
  };
}
