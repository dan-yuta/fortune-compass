import { etoAnimals, etoDirections, etoAdvice } from '../data/eto-data';
import { getDateSeed, seededChoice, seededScore } from '../utils/seed-random';

export interface EtoResult {
  fortuneType: 'eto';
  animal: string;
  animalEn: string;
  personality: string;
  score: number;
  luckyDirection: string;
  advice: string;
}

export function getEtoFortune(birthday: string): EtoResult {
  const date = new Date(birthday);
  if (isNaN(date.getTime())) {
    throw new Error('Invalid birthday format');
  }

  const year = date.getUTCFullYear();
  const index = ((year - 4) % 12 + 12) % 12;
  const eto = etoAnimals[index];
  const dateSeed = getDateSeed();
  const baseSeed = `${dateSeed}-eto-${eto.animalEn}`;

  return {
    fortuneType: 'eto',
    animal: eto.animal,
    animalEn: eto.animalEn,
    personality: eto.personality,
    score: seededScore(`${baseSeed}-score`),
    luckyDirection: seededChoice(`${baseSeed}-direction`, etoDirections),
    advice: seededChoice(`${baseSeed}-advice`, etoAdvice),
  };
}
