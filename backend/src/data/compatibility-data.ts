// Element compatibility for zodiac signs
// fire: aries, leo, sagittarius
// earth: taurus, virgo, capricorn
// air: gemini, libra, aquarius
// water: cancer, scorpio, pisces

export type ZodiacElement = 'fire' | 'earth' | 'air' | 'water';

export const signToElement: Record<string, ZodiacElement> = {
  aries: 'fire', taurus: 'earth', gemini: 'air', cancer: 'water',
  leo: 'fire', virgo: 'earth', libra: 'air', scorpio: 'water',
  sagittarius: 'fire', capricorn: 'earth', aquarius: 'air', pisces: 'water',
};

// Element compatibility scores (0-100)
export const elementCompatibility: Record<string, number> = {
  'fire-fire': 80,
  'fire-earth': 50,
  'fire-air': 90,
  'fire-water': 40,
  'earth-earth': 75,
  'earth-air': 45,
  'earth-water': 85,
  'air-air': 70,
  'air-water': 55,
  'water-water': 80,
};

export function getElementScore(e1: ZodiacElement, e2: ZodiacElement): number {
  const key1 = `${e1}-${e2}`;
  const key2 = `${e2}-${e1}`;
  return elementCompatibility[key1] ?? elementCompatibility[key2] ?? 60;
}

// Blood type compatibility (4x4)
export const bloodTypeCompatibility: Record<string, Record<string, number>> = {
  A: { A: 75, B: 55, O: 85, AB: 65 },
  B: { A: 55, B: 70, O: 80, AB: 75 },
  O: { A: 85, B: 80, O: 70, AB: 60 },
  AB: { A: 65, B: 75, O: 60, AB: 80 },
};

// Numerology compatibility (destiny number 1-9)
// Higher = more compatible
export const numerologyCompatibility: Record<number, Record<number, number>> = {
  1: { 1: 70, 2: 65, 3: 85, 4: 55, 5: 90, 6: 60, 7: 75, 8: 65, 9: 80 },
  2: { 1: 65, 2: 75, 3: 60, 4: 85, 5: 55, 6: 90, 7: 60, 8: 80, 9: 70 },
  3: { 1: 85, 2: 60, 3: 70, 4: 55, 5: 80, 6: 75, 7: 90, 8: 50, 9: 85 },
  4: { 1: 55, 2: 85, 3: 55, 4: 70, 5: 60, 6: 80, 7: 65, 8: 90, 9: 50 },
  5: { 1: 90, 2: 55, 3: 80, 4: 60, 5: 70, 6: 55, 7: 85, 8: 60, 9: 75 },
  6: { 1: 60, 2: 90, 3: 75, 4: 80, 5: 55, 6: 70, 7: 55, 8: 65, 9: 90 },
  7: { 1: 75, 2: 60, 3: 90, 4: 65, 5: 85, 6: 55, 7: 70, 8: 55, 9: 60 },
  8: { 1: 65, 2: 80, 3: 50, 4: 90, 5: 60, 6: 65, 7: 55, 8: 70, 9: 55 },
  9: { 1: 80, 2: 70, 3: 85, 4: 50, 5: 75, 6: 90, 7: 60, 8: 55, 9: 70 },
};

export const compatibilityMessages: { range: [number, number]; message: string }[] = [
  { range: [90, 100], message: '最高の相性です！二人は深い絆で結ばれた運命的なパートナーです。お互いの存在が最大の幸福をもたらすでしょう。' },
  { range: [80, 89], message: '素晴らしい相性です。自然体でいられる心地よい関係を築けるでしょう。信頼と尊重が絆をさらに強くします。' },
  { range: [70, 79], message: '良い相性です。お互いの違いを認め合うことで、バランスの取れた関係が築けます。コミュニケーションを大切にしましょう。' },
  { range: [60, 69], message: 'まずまずの相性です。共通の趣味や目標を見つけることで、関係がより深まります。理解し合う努力が実を結ぶでしょう。' },
  { range: [50, 59], message: '努力次第で良い関係になれる相性です。異なる視点を持つ二人だからこそ、お互いから学び合えることがたくさんあります。' },
  { range: [0, 49], message: 'チャレンジングな相性ですが、それだけに成長の可能性も大きいです。違いを楽しみ、お互いを尊重することが鍵です。' },
];

export function getCompatibilityMessage(score: number): string {
  for (const entry of compatibilityMessages) {
    if (score >= entry.range[0] && score <= entry.range[1]) {
      return entry.message;
    }
  }
  return compatibilityMessages[compatibilityMessages.length - 1].message;
}
