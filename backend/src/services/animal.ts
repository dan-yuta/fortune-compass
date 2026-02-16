import { animalCharacters, birthdayToAnimalIndex, animalAdvice } from '../data/animal-data';
import { getDateSeed, seededChoice, seededScore } from '../utils/seed-random';

export interface AnimalResult {
  fortuneType: 'animal';
  animal: string;
  color: string;
  character: string;
  personality: string;
  score: number;
  compatibility: string;
  advice: string;
}

export function getAnimalFortune(birthday: string): AnimalResult {
  const date = new Date(birthday);
  if (isNaN(date.getTime())) {
    throw new Error('Invalid birthday format');
  }

  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const key = `${month}-${day}`;
  const index = birthdayToAnimalIndex[key] ?? 0;
  const character = animalCharacters[index];

  const dateSeed = getDateSeed();
  const baseSeed = `${dateSeed}-animal-${character.character}`;

  return {
    fortuneType: 'animal',
    animal: character.animal,
    color: character.color,
    character: character.character,
    personality: character.personality,
    score: seededScore(`${baseSeed}-score`),
    compatibility: character.compatibility,
    advice: seededChoice(`${baseSeed}-advice`, animalAdvice),
  };
}
