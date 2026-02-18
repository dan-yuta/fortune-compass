import { runes, runeMessages } from '../data/rune-data';
import { getDateSeed, seededRandom, seededChoice } from '../utils/seed-random';
import { getMoonPhase } from '../utils/moon-phase';

export interface RuneStone {
  name: string;
  nameEn: string;
  meaning: string;
  isReversed: boolean;
  position: string;
  positionLabel: string;
}

export interface RuneResult {
  fortuneType: 'rune';
  stones: RuneStone[];
  overallMessage: string;
  moonPhase?: string;
}

export function getRuneFortune(birthday: string, name: string): RuneResult {
  const dateSeed = getDateSeed();
  const baseSeed = `${dateSeed}-rune-${birthday}-${name}`;

  // Select 3 unique runes using seeded random
  const indices: number[] = [];
  let attempts = 0;
  while (indices.length < 3 && attempts < 100) {
    const idx = Math.floor(seededRandom(`${baseSeed}-pick-${attempts}`) * runes.length);
    if (!indices.includes(idx)) {
      indices.push(idx);
    }
    attempts++;
  }

  const positions = [
    { position: 'past', positionLabel: '過去' },
    { position: 'present', positionLabel: '現在' },
    { position: 'future', positionLabel: '未来' },
  ];

  const stones: RuneStone[] = indices.map((runeIdx, i) => {
    const rune = runes[runeIdx];
    const isReversed = rune.canReverse && seededRandom(`${baseSeed}-reverse-${i}`) > 0.5;

    return {
      name: rune.name,
      nameEn: rune.nameEn,
      meaning: isReversed ? rune.reversedMeaning : rune.meaning,
      isReversed,
      position: positions[i].position,
      positionLabel: positions[i].positionLabel,
    };
  });

  let overallMessage = seededChoice(`${baseSeed}-message`, runeMessages);

  // Moon phase message
  const moonInfo = getMoonPhase(new Date());
  if (moonInfo.phaseEn === 'full_moon') {
    overallMessage += `\n\n${moonInfo.phase}の力がルーンの啓示を増幅させています。直感を信じて行動しましょう。`;
  } else if (moonInfo.phaseEn === 'new_moon') {
    overallMessage += `\n\n${moonInfo.phase}の静寂がルーンの深い意味を浮かび上がらせています。内なる声に耳を傾けてください。`;
  } else {
    overallMessage += `\n\n${moonInfo.phase}のエネルギーがルーンのメッセージに穏やかな力を添えています。`;
  }

  return {
    fortuneType: 'rune',
    stones,
    overallMessage,
    moonPhase: moonInfo.phase,
  };
}
