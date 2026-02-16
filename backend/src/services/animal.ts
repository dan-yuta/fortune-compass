import { animalCharacters, animalAdvice, groupNames, groupDescriptions } from '../data/animal-data';
import { getDateSeed, seededChoice, seededScore } from '../utils/seed-random';

export interface AnimalResult {
  fortuneType: 'animal';
  animal: string;
  color: string;
  character: string;
  group: string;
  groupDescription: string;
  personality: string;
  score: number;
  compatibility: string;
  advice: string;
}

/**
 * 生年月日からキャラナンバー(1-60)を算出する
 * 計算式: (Excelシリアル値 + 8) % 60 + 1
 * Excelシリアル値 = 1899年12月30日からの日数
 */
function getCharacterNumber(year: number, month: number, day: number): number {
  // JDN (Julian Day Number) を算出
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  const jdn = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;

  // Excelシリアル値 = JDN - 2415019 (1899-12-30のJDN)
  const serial = jdn - 2415019;

  // キャラナンバー = (serial + 8) % 60 + 1
  return (serial + 8) % 60 + 1;
}

export function getAnimalFortune(birthday: string): AnimalResult {
  const date = new Date(birthday);
  if (isNaN(date.getTime())) {
    throw new Error('Invalid birthday format');
  }

  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();

  const characterNumber = getCharacterNumber(year, month, day);
  const character = animalCharacters[characterNumber - 1]; // 0-indexed array

  const dateSeed = getDateSeed();
  const baseSeed = `${dateSeed}-animal-${character.character}`;

  return {
    fortuneType: 'animal',
    animal: character.animal,
    color: character.color,
    character: character.character,
    group: groupNames[character.group],
    groupDescription: groupDescriptions[character.group],
    personality: character.personality,
    score: seededScore(`${baseSeed}-score`),
    compatibility: character.compatibility,
    advice: seededChoice(`${baseSeed}-advice`, animalAdvice),
  };
}
