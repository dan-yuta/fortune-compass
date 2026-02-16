import { kyuseiStars, kyuseiDirections, kyuseiAdvice } from '../data/kyusei-data';
import { getDateSeed, seededChoice, seededScore } from '../utils/seed-random';

export interface KyuseiResult {
  fortuneType: 'kyusei';
  star: string;
  element: string;
  personality: string;
  score: number;
  luckyDirection: string;
  advice: string;
}

function getKyuseiIndex(year: number): number {
  // Formula: (11 - (year - 3) % 9) % 9
  return ((11 - ((year - 3) % 9)) % 9 + 9) % 9;
}

export function getKyuseiFortune(birthday: string): KyuseiResult {
  const date = new Date(birthday);
  if (isNaN(date.getTime())) {
    throw new Error('Invalid birthday format');
  }

  const year = date.getUTCFullYear();
  const index = getKyuseiIndex(year);
  const star = kyuseiStars[index];

  const dateSeed = getDateSeed();
  const baseSeed = `${dateSeed}-kyusei-${star.star}`;

  return {
    fortuneType: 'kyusei',
    star: star.star,
    element: star.element,
    personality: star.personality,
    score: seededScore(`${baseSeed}-score`),
    luckyDirection: kyuseiDirections[index],
    advice: seededChoice(`${baseSeed}-advice`, kyuseiAdvice),
  };
}
