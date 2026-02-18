export interface UserProfile {
  name: string;
  nameKana: string;
  nameRomaji: string;
  birthday: string;
  bloodType: string | null;
  birthTime?: string;
  gender?: 'male' | 'female';
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
  astronomicalSign?: string;
  astronomicalSignEn?: string;
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
  moonPhase?: string;
}

export interface RadarScores {
  overall: number;
  love: number;
  work: number;
  money: number;
}

export interface DashboardResult {
  fortuneType: "dashboard";
  radar: RadarScores;
  zodiac: ZodiacResult;
  numerology: NumerologyResult;
  bloodType: BloodTypeResult | null;
  tarot: TarotResult;
  overallAdvice: string;
}

// --- New fortune result types ---

export interface EtoResult {
  fortuneType: "eto";
  animal: string;
  animalEn: string;
  personality: string;
  score: number;
  luckyDirection: string;
  advice: string;
}

export interface BirthFlowerResult {
  fortuneType: "birth-flower";
  flower: string;
  flowerLanguage: string;
  personality: string;
  score: number;
  advice: string;
}

export interface BirthstoneResult {
  fortuneType: "birthstone";
  stone: string;
  stoneEn: string;
  effect: string;
  personality: string;
  score: number;
  advice: string;
}

export interface WeekdayResult {
  fortuneType: "weekday";
  weekday: string;
  weekdayEn: string;
  personality: string;
  score: number;
  luckyColor: string;
  advice: string;
}

export interface KyuseiResult {
  fortuneType: "kyusei";
  star: string;
  element: string;
  personality: string;
  score: number;
  luckyDirection: string;
  advice: string;
  isBeforeLichun?: boolean;
}

export interface AnimalResult {
  fortuneType: "animal";
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

export interface ShichuuResult {
  fortuneType: "shichuu";
  yearPillar: string;
  monthPillar: string;
  dayPillar: string;
  hourPillar?: string;
  dayMaster: string;
  element: string;
  personality: string;
  score: number;
  advice: string;
}

export interface OmikujiResult {
  fortuneType: "omikuji";
  rank: string;
  rankLevel: number;
  wish: string;
  health: string;
  love: string;
  work: string;
  money: string;
  travel: string;
  overallMessage: string;
  moonPhase?: string;
}

export interface RuneStone {
  name: string;
  nameEn: string;
  meaning: string;
  isReversed: boolean;
  position: string;
  positionLabel: string;
}

export interface RuneResult {
  fortuneType: "rune";
  stones: RuneStone[];
  overallMessage: string;
  moonPhase?: string;
}

export interface FengshuiResult {
  fortuneType: "fengshui";
  gua: string;
  guaNumber: number;
  element: string;
  luckyDirections: string[];
  unluckyDirections: string[];
  score: number;
  advice: string;
  isBeforeLichun?: boolean;
}

export interface DreamResult {
  fortuneType: "dream";
  keyword: string;
  meaning: string;
  category: string;
  score: number;
  advice: string;
}

export interface PalmResult {
  fortuneType: "palm";
  analysis: string;
  lifeLine: string;
  headLine: string;
  heartLine: string;
  fateLine: string;
  overallMessage: string;
}

export interface CompatibilityResult {
  fortuneType: "compatibility";
  overallScore: number;
  zodiacScore: number;
  bloodTypeScore: number | null;
  numerologyScore: number;
  person1Sign: string;
  person2Sign: string;
  advice: string;
  detailMessage: string;
}

export interface TrendDay {
  date: string;
  dayLabel: string;
  overall: number;
  love: number;
  work: number;
  money: number;
}

export interface TrendsResult {
  fortuneType: "trends";
  days: TrendDay[];
  bestDay: string;
  worstDay: string;
  advice: string;
}

export interface AiReadingResult {
  fortuneType: "ai-reading";
  reading: string;
  highlights: string[];
  luckyAction: string;
  includedFortunes: string[];
}
