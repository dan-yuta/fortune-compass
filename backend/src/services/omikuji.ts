import {
  omikujiRanks,
  omikujiWish,
  omikujiHealth,
  omikujiLove,
  omikujiWork,
  omikujiMoney,
  omikujiTravel,
  omikujiMessages,
} from '../data/omikuji-data';
import { getDateSeed, seededRandom, seededChoice } from '../utils/seed-random';
import { getMoonPhase } from '../utils/moon-phase';

export interface OmikujiResult {
  fortuneType: 'omikuji';
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

export function getOmikujiFortune(birthday: string, name: string): OmikujiResult {
  const dateSeed = getDateSeed();
  const baseSeed = `${dateSeed}-omikuji-${birthday}-${name}`;

  // Moon phase adjusts weights
  const moonInfo = getMoonPhase(new Date());
  let weights: number[];
  if (moonInfo.phaseEn === 'full_moon') {
    // Full moon: increase 大吉, decrease 凶系
    weights = [15, 22, 25, 20, 13, 4, 1]; // 大吉, 吉, 中吉, 小吉, 末吉, 凶, 大凶
  } else if (moonInfo.phaseEn === 'new_moon') {
    // New moon: more even distribution (introspective)
    weights = [12, 16, 18, 18, 16, 12, 8]; // 大吉, 吉, 中吉, 小吉, 末吉, 凶, 大凶
  } else {
    // Default weights
    weights = [10, 20, 25, 20, 15, 7, 3]; // 大吉, 吉, 中吉, 小吉, 末吉, 凶, 大凶
  }
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const rand = seededRandom(`${baseSeed}-rank`) * totalWeight;
  let cumulative = 0;
  let rankIndex = 0;
  for (let i = 0; i < weights.length; i++) {
    cumulative += weights[i];
    if (rand < cumulative) {
      rankIndex = i;
      break;
    }
  }

  const rank = omikujiRanks[rankIndex];

  return {
    fortuneType: 'omikuji',
    rank: rank.rank,
    rankLevel: rank.rankLevel,
    wish: seededChoice(`${baseSeed}-wish`, omikujiWish),
    health: seededChoice(`${baseSeed}-health`, omikujiHealth),
    love: seededChoice(`${baseSeed}-love`, omikujiLove),
    work: seededChoice(`${baseSeed}-work`, omikujiWork),
    money: seededChoice(`${baseSeed}-money`, omikujiMoney),
    travel: seededChoice(`${baseSeed}-travel`, omikujiTravel),
    overallMessage: seededChoice(`${baseSeed}-message`, omikujiMessages),
    moonPhase: moonInfo.phase,
  };
}
