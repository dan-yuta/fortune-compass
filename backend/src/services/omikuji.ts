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
}

export function getOmikujiFortune(birthday: string, name: string): OmikujiResult {
  const dateSeed = getDateSeed();
  const baseSeed = `${dateSeed}-omikuji-${birthday}-${name}`;

  // Weighted random for rank selection (大吉 is rarer than 中吉 etc.)
  const weights = [10, 20, 25, 20, 15, 7, 3]; // 大吉, 吉, 中吉, 小吉, 末吉, 凶, 大凶
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
  };
}
