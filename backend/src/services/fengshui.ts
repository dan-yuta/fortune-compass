import { guaData, calculateGuaNumber, fengshuiAdvice } from '../data/fengshui-data';
import { getDateSeed, seededChoice, seededScore } from '../utils/seed-random';

export interface FengshuiResult {
  fortuneType: 'fengshui';
  gua: string;
  guaNumber: number;
  element: string;
  luckyDirections: string[];
  unluckyDirections: string[];
  score: number;
  advice: string;
}

export function getFengshuiFortune(birthday: string, gender: 'male' | 'female'): FengshuiResult {
  const date = new Date(birthday);
  if (isNaN(date.getTime())) {
    throw new Error('Invalid birthday format');
  }

  const year = date.getUTCFullYear();
  const guaNumber = calculateGuaNumber(year, gender);
  const guaInfo = guaData.find(g => g.guaNumber === guaNumber);

  if (!guaInfo) {
    throw new Error('Could not determine gua');
  }

  const dateSeed = getDateSeed();
  const baseSeed = `${dateSeed}-fengshui-${guaInfo.gua}-${gender}`;

  return {
    fortuneType: 'fengshui',
    gua: guaInfo.gua,
    guaNumber: guaInfo.guaNumber,
    element: guaInfo.element,
    luckyDirections: guaInfo.luckyDirections,
    unluckyDirections: guaInfo.unluckyDirections,
    score: seededScore(`${baseSeed}-score`),
    advice: seededChoice(`${baseSeed}-advice`, fengshuiAdvice),
  };
}
