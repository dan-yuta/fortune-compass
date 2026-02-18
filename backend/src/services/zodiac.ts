import { zodiacSigns, luckyColors, luckyItems, zodiacAdvice, ZodiacSign } from '../data/zodiac-data';
import { getDateSeed, seededChoice, seededScore } from '../utils/seed-random';
import { getAstronomicalSign } from '../utils/astronomical-zodiac';

export interface ZodiacResult {
  fortuneType: 'zodiac';
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

function findZodiacSign(month: number, day: number): ZodiacSign {
  // Handle Capricorn's year-crossing boundary first
  const capricorn = zodiacSigns.find(z => z.signEn === 'capricorn')!;
  if ((month === 12 && day >= capricorn.startDay) || (month === 1 && day <= capricorn.endDay)) {
    return capricorn;
  }

  for (const sign of zodiacSigns) {
    if (sign.signEn === 'capricorn') continue;
    const monthDay = month * 100 + day;
    const startMonthDay = sign.startMonth * 100 + sign.startDay;
    const endMonthDay = sign.endMonth * 100 + sign.endDay;
    if (monthDay >= startMonthDay && monthDay <= endMonthDay) {
      return sign;
    }
  }

  throw new Error(`Invalid date: month=${month}, day=${day}`);
}

export function getZodiacFortune(birthday: string): ZodiacResult {
  const date = new Date(birthday);
  if (isNaN(date.getTime())) {
    throw new Error('Invalid birthday format');
  }

  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const sign = findZodiacSign(month, day);
  const dateSeed = getDateSeed();
  const baseSeed = `${dateSeed}-${sign.signEn}`;

  // Astronomical zodiac calculation
  const astroSign = getAstronomicalSign(date);
  const isDifferent = astroSign.signEn !== sign.signEn;

  return {
    fortuneType: 'zodiac',
    sign: sign.sign,
    signEn: sign.signEn,
    element: sign.element,
    score: seededScore(`${baseSeed}-score`),
    luckyColor: seededChoice(`${baseSeed}-color`, luckyColors),
    luckyItem: seededChoice(`${baseSeed}-item`, luckyItems),
    advice: seededChoice(`${baseSeed}-advice`, zodiacAdvice),
    astronomicalSign: isDifferent ? astroSign.sign : undefined,
    astronomicalSignEn: isDifferent ? astroSign.signEn : undefined,
  };
}
