export interface UserProfile {
  name: string;
  nameKana: string;
  nameRomaji: string;
  birthday: string;
  bloodType: string | null;
}

export interface ZodiacResult {
  fortuneType: "zodiac";
  sign: string;
  signEn: string;
  element: string;
  score: number;
  luckyColor: string;
  luckyItem: string;
  advice: string;
}

export interface NumerologyResult {
  fortuneType: "numerology";
  destinyNumber: number;
  personalityTraits: string[];
  yearFortune: string;
  compatibility: number[];
  advice: string;
}

export interface BloodTypeResult {
  fortuneType: "blood-type";
  bloodType: string;
  personality: string;
  score: number;
  compatibilityRanking: string[];
  advice: string;
}

export interface TarotCard {
  position: string;
  positionLabel: string;
  name: string;
  nameEn: string;
  number: number;
  arcana: string;
  isReversed: boolean;
  meaning: string;
  reversedMeaning: string;
}

export interface TarotResult {
  fortuneType: "tarot";
  spread: string;
  cards: TarotCard[];
  overallMessage: string;
}
