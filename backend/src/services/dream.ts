import { dreamKeywords, dreamAdvice } from '../data/dream-data';
import { getDateSeed, seededChoice, seededScore } from '../utils/seed-random';

export interface DreamResult {
  fortuneType: 'dream';
  keyword: string;
  meaning: string;
  category: string;
  score: number;
  advice: string;
}

export function getDreamFortune(keyword: string): DreamResult {
  if (!keyword || typeof keyword !== 'string') {
    throw new Error('keyword is required');
  }

  const trimmed = keyword.trim();

  // Find exact or partial match
  let match = dreamKeywords.find(dk => dk.keyword === trimmed);
  if (!match) {
    match = dreamKeywords.find(dk => trimmed.includes(dk.keyword) || dk.keyword.includes(trimmed));
  }

  if (!match) {
    // If no match, provide a generic result using seeded randomness
    const dateSeed = getDateSeed();
    const baseSeed = `${dateSeed}-dream-${trimmed}`;
    return {
      fortuneType: 'dream',
      keyword: trimmed,
      meaning: `「${trimmed}」の夢は、あなたの深層心理が変化を求めているサインです。今の自分を見つめ直し、新しい一歩を踏み出すタイミングかもしれません。`,
      category: 'その他',
      score: seededScore(`${baseSeed}-score`),
      advice: seededChoice(`${baseSeed}-advice`, dreamAdvice),
    };
  }

  const dateSeed = getDateSeed();
  const baseSeed = `${dateSeed}-dream-${match.keyword}`;

  return {
    fortuneType: 'dream',
    keyword: match.keyword,
    meaning: match.meaning,
    category: match.category,
    score: seededScore(`${baseSeed}-score`),
    advice: seededChoice(`${baseSeed}-advice`, dreamAdvice),
  };
}
