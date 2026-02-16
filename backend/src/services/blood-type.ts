import { bloodTypeData, bloodTypeAdvice } from '../data/blood-type-data';
import { getDateSeed, seededChoice, seededScore } from '../utils/seed-random';

export interface BloodTypeResult {
  fortuneType: 'blood-type';
  bloodType: string;
  personality: string;
  score: number;
  compatibilityRanking: string[];
  advice: string;
}

const VALID_BLOOD_TYPES = ['A', 'B', 'O', 'AB'];

export function getBloodTypeFortune(bloodType: string): BloodTypeResult {
  if (!VALID_BLOOD_TYPES.includes(bloodType)) {
    throw new Error(`Invalid blood type: ${bloodType}`);
  }

  const data = bloodTypeData[bloodType];
  const dateSeed = getDateSeed();
  const baseSeed = `${dateSeed}-${bloodType}`;

  return {
    fortuneType: 'blood-type',
    bloodType,
    personality: data.personality,
    score: seededScore(`${baseSeed}-score`),
    compatibilityRanking: data.compatibilityRanking,
    advice: seededChoice(`${baseSeed}-advice`, bloodTypeAdvice),
  };
}
