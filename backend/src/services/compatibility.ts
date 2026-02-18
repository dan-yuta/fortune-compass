import { zodiacSigns } from '../data/zodiac-data';
import {
  signToElement,
  getElementScore,
  bloodTypeCompatibility,
  numerologyCompatibility,
  getCompatibilityMessage,
} from '../data/compatibility-data';

export interface CompatibilityResult {
  fortuneType: 'compatibility';
  overallScore: number;
  zodiacScore: number;
  bloodTypeScore: number | null;
  numerologyScore: number;
  person1Sign: string;
  person2Sign: string;
  advice: string;
  detailMessage: string;
}

function findSign(month: number, day: number): { sign: string; signEn: string } {
  const capricorn = zodiacSigns.find(z => z.signEn === 'capricorn')!;
  if ((month === 12 && day >= capricorn.startDay) || (month === 1 && day <= capricorn.endDay)) {
    return { sign: capricorn.sign, signEn: capricorn.signEn };
  }
  for (const sign of zodiacSigns) {
    if (sign.signEn === 'capricorn') continue;
    const monthDay = month * 100 + day;
    const startMonthDay = sign.startMonth * 100 + sign.startDay;
    const endMonthDay = sign.endMonth * 100 + sign.endDay;
    if (monthDay >= startMonthDay && monthDay <= endMonthDay) {
      return { sign: sign.sign, signEn: sign.signEn };
    }
  }
  return { sign: '牡羊座', signEn: 'aries' };
}

function getDestinyNumber(birthday: string, name?: string): number {
  const digits = birthday.replace(/-/g, '');
  let sum = 0;
  for (const ch of digits) {
    sum += parseInt(ch, 10);
  }
  if (name) {
    for (let i = 0; i < name.length; i++) {
      sum += name.charCodeAt(i);
    }
  }
  // Reduce to single digit
  while (sum >= 10) {
    let temp = 0;
    while (sum > 0) {
      temp += sum % 10;
      sum = Math.floor(sum / 10);
    }
    sum = temp;
  }
  return sum || 1;
}

export function getCompatibilityFortune(
  birthday1: string,
  birthday2: string,
  name1?: string,
  name2?: string,
  bloodType1?: string,
  bloodType2?: string,
): CompatibilityResult {
  const date1 = new Date(birthday1);
  const date2 = new Date(birthday2);

  if (isNaN(date1.getTime()) || isNaN(date2.getTime())) {
    throw new Error('Invalid birthday format');
  }

  // Zodiac compatibility
  const sign1 = findSign(date1.getUTCMonth() + 1, date1.getUTCDate());
  const sign2 = findSign(date2.getUTCMonth() + 1, date2.getUTCDate());
  const elem1 = signToElement[sign1.signEn] || 'fire';
  const elem2 = signToElement[sign2.signEn] || 'fire';
  const zodiacScore = getElementScore(elem1, elem2);

  // Blood type compatibility
  let bloodTypeScore: number | null = null;
  if (bloodType1 && bloodType2 && bloodTypeCompatibility[bloodType1] && bloodTypeCompatibility[bloodType1][bloodType2]) {
    bloodTypeScore = bloodTypeCompatibility[bloodType1][bloodType2];
  }

  // Numerology compatibility
  const destiny1 = getDestinyNumber(birthday1, name1);
  const destiny2 = getDestinyNumber(birthday2, name2);
  const numerologyScore = numerologyCompatibility[destiny1]?.[destiny2] ?? 60;

  // Overall score: weighted average
  let totalWeight = 0;
  let totalScore = 0;

  totalScore += zodiacScore * 40;
  totalWeight += 40;

  totalScore += numerologyScore * 30;
  totalWeight += 30;

  if (bloodTypeScore !== null) {
    totalScore += bloodTypeScore * 30;
    totalWeight += 30;
  }

  const overallScore = Math.round(totalScore / totalWeight);
  const advice = getCompatibilityMessage(overallScore);

  // Detail message
  const details: string[] = [];
  details.push(`${sign1.sign}と${sign2.sign}は${elem1 === elem2 ? '同じ' : '異なる'}エレメントの組み合わせです。`);
  details.push(`数秘術の運命数${destiny1}と${destiny2}の相性が結果に反映されています。`);
  if (bloodTypeScore !== null) {
    details.push(`血液型${bloodType1}型と${bloodType2}型の相性も考慮されています。`);
  }

  return {
    fortuneType: 'compatibility',
    overallScore,
    zodiacScore,
    bloodTypeScore,
    numerologyScore,
    person1Sign: sign1.sign,
    person2Sign: sign2.sign,
    advice,
    detailMessage: details.join(''),
  };
}
