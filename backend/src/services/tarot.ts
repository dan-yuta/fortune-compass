import { majorArcana, overallMessages, TarotCardData } from '../data/tarot-cards';

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

  const overallMessage = overallMessages[Math.floor(Math.random() * overallMessages.length)];

  return {
    fortuneType: 'tarot',
    spread: 'three-card',
    cards,
    overallMessage,
  };
}
