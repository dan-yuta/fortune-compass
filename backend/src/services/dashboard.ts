import { getZodiacFortune, ZodiacResult } from './zodiac';
import { getNumerologyFortune, NumerologyResult } from './numerology';
import { getBloodTypeFortune, BloodTypeResult } from './blood-type';
import { getTarotFortune, TarotResult } from './tarot';
import { seededScore, getDateSeed } from '../utils/seed-random';

export interface RadarScores {
  overall: number;    // 総合運 (1-5)
  love: number;       // 恋愛運 (1-5)
  work: number;       // 仕事運 (1-5)
  money: number;      // 金運 (1-5)
}

export interface DashboardResult {
  fortuneType: 'dashboard';
  radar: RadarScores;
  zodiac: ZodiacResult;
  numerology: NumerologyResult;
  bloodType: BloodTypeResult | null;
  tarot: TarotResult;
  overallAdvice: string;
}

// Positive tarot cards that boost scores
const POSITIVE_CARDS = new Set([
  0,  // 愚者 - new beginnings
  1,  // 魔術師 - creativity
  3,  // 女帝 - abundance
  6,  // 恋人 - love
  7,  // 戦車 - victory
  8,  // 力 - strength
  10, // 運命の輪 - fortune
  14, // 節制 - balance
  17, // 星 - hope
  19, // 太陽 - success
  21, // 世界 - completion
]);

function computeRadar(
  zodiac: ZodiacResult,
  numerology: NumerologyResult,
  bloodType: BloodTypeResult | null,
  tarot: TarotResult,
  birthday: string,
): RadarScores {
  const dateSeed = getDateSeed();

  // 総合運: zodiac score + blood type score average, or zodiac only
  let overall: number;
  if (bloodType) {
    overall = Math.round((zodiac.score + bloodType.score) / 2);
  } else {
    overall = zodiac.score;
  }
  overall = Math.max(1, Math.min(5, overall));

  // 恋愛運: Seed-based with bonus from tarot love cards and compatibility
  let love = seededScore(`${dateSeed}-${birthday}-love`);
  const hasLoverCard = tarot.cards.some(c => c.number === 6 && !c.isReversed); // 恋人 upright
  if (hasLoverCard) love = Math.min(5, love + 1);

  // 仕事運: Seed-based with bonus from positive tarot and numerology traits
  let work = seededScore(`${dateSeed}-${birthday}-work`);
  const workTraits = ['リーダーシップ', '実行力', '野心', '組織力', '堅実'];
  const hasWorkTrait = numerology.personalityTraits.some(t => workTraits.includes(t));
  if (hasWorkTrait) work = Math.min(5, work + 1);

  // 金運: Seed-based with bonus from positive upright tarot cards
  let money = seededScore(`${dateSeed}-${birthday}-money`);
  const positiveUprightCount = tarot.cards.filter(
    c => POSITIVE_CARDS.has(c.number) && !c.isReversed
  ).length;
  if (positiveUprightCount >= 2) money = Math.min(5, money + 1);

  return { overall, love, work, money };
}

const overallAdvices = [
  '今日は全体的にバランスの取れた一日です。直感を信じて行動することで、良い結果が得られるでしょう。',
  '運気の波に乗っています。積極的に新しいことに挑戦してみましょう。思いがけないチャンスが訪れるかもしれません。',
  '穏やかなエネルギーに包まれた一日です。無理をせず、自分のペースで過ごすことが開運の秘訣です。',
  '人との繋がりが幸運を呼ぶ日です。コミュニケーションを大切にし、周囲の人に感謝の気持ちを伝えましょう。',
  '内面の力が高まっています。自分の可能性を信じて、一歩一歩着実に前進していきましょう。',
  '変化の兆しがある一日です。柔軟な姿勢で新しい流れを受け入れることで、運気が大きく好転します。',
];

export function getDashboardFortune(
  birthday: string,
  name?: string,
  bloodType?: string,
): DashboardResult {
  const date = new Date(birthday);
  if (isNaN(date.getTime())) {
    throw new Error('Invalid birthday format');
  }

  const zodiac = getZodiacFortune(birthday);
  const numerology = getNumerologyFortune(birthday, name);
  const bloodTypeResult = bloodType ? getBloodTypeFortune(bloodType) : null;
  const tarot = getTarotFortune();

  const radar = computeRadar(zodiac, numerology, bloodTypeResult, tarot, birthday);

  const dateSeed = getDateSeed();
  const adviceIndex = Math.abs(
    dateSeed.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  ) % overallAdvices.length;

  return {
    fortuneType: 'dashboard',
    radar,
    zodiac,
    numerology,
    bloodType: bloodTypeResult,
    tarot,
    overallAdvice: overallAdvices[adviceIndex],
  };
}
