import { birthFlowers, birthFlowerAdvice } from '../data/birth-flower-data';
import { getDateSeed, seededChoice, seededScore } from '../utils/seed-random';

export interface BirthFlowerResult {
  fortuneType: 'birth-flower';
  flower: string;
  flowerLanguage: string;
  personality: string;
  score: number;
  advice: string;
}

export function getBirthFlowerFortune(birthday: string): BirthFlowerResult {
  const date = new Date(birthday);
  if (isNaN(date.getTime())) {
    throw new Error('Invalid birthday format');
  }

  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const flower = birthFlowers.find(f => f.month === month && f.day === day);

  if (!flower) {
    throw new Error('Birth flower not found for this date');
  }

  const dateSeed = getDateSeed();
  const baseSeed = `${dateSeed}-birth-flower-${month}-${day}`;

  return {
    fortuneType: 'birth-flower',
    flower: flower.flower,
    flowerLanguage: flower.flowerLanguage,
    personality: flower.personality,
    score: seededScore(`${baseSeed}-score`),
    advice: seededChoice(`${baseSeed}-advice`, birthFlowerAdvice),
  };
}
