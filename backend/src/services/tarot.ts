import { majorArcana, overallMessages, TarotCardData } from '../data/tarot-cards';
import { getMoonPhase } from '../utils/moon-phase';

export interface TarotCardResult {
  position: string;
  positionLabel: string;
  name: string;
  nameEn: string;
  number: number;
  arcana: 'major';
  isReversed: boolean;
  meaning: string;
  reversedMeaning: string;
}

export interface TarotResult {
  fortuneType: 'tarot';
  spread: 'three-card';
  cards: TarotCardResult[];
  overallMessage: string;
  moonPhase?: string;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const positions = [
  { position: 'past', positionLabel: '過去' },
  { position: 'present', positionLabel: '現在' },
  { position: 'future', positionLabel: '未来' },
];

export function getTarotFortune(): TarotResult {
  const shuffled = shuffleArray(majorArcana);
  const drawn = shuffled.slice(0, 3);

  const cards: TarotCardResult[] = drawn.map((card: TarotCardData, i: number) => ({
    position: positions[i].position,
    positionLabel: positions[i].positionLabel,
    name: card.name,
    nameEn: card.nameEn,
    number: card.number,
    arcana: 'major' as const,
    isReversed: Math.random() < 0.5,
    meaning: card.meaning,
    reversedMeaning: card.reversedMeaning,
  }));

  let overallMessage = overallMessages[Math.floor(Math.random() * overallMessages.length)];

  // Moon phase bonus
  const moonInfo = getMoonPhase(new Date());
  let moonMessage = '';
  if (moonInfo.phaseEn === 'full_moon') {
    moonMessage = `${moonInfo.phase}の夜 - 直感力が最大限に高まっています。ポジティブなカードの影響がより強く現れるでしょう。`;
  } else if (moonInfo.phaseEn === 'new_moon') {
    moonMessage = `${moonInfo.phase}の夜 - 内省の力が強まっています。逆位置のカードからより深い気づきが得られるでしょう。`;
  } else if (moonInfo.phaseEn === 'first_quarter' || moonInfo.phaseEn === 'waxing_crescent' || moonInfo.phaseEn === 'waxing_gibbous') {
    moonMessage = `${moonInfo.phase}の夜 - 月の満ちる力が後押ししています。前向きな行動が吉です。`;
  } else {
    moonMessage = `${moonInfo.phase}の夜 - 月の静かなエネルギーが内面を照らしています。振り返りの時期です。`;
  }

  overallMessage = `${overallMessage}\n\n${moonMessage}`;

  return {
    fortuneType: 'tarot',
    spread: 'three-card',
    cards,
    overallMessage,
    moonPhase: moonInfo.phase,
  };
}
