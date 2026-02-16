import { weekdays, weekdayAdvice } from '../data/weekday-data';
import { getDateSeed, seededScore, seededChoice } from '../utils/seed-random';

export interface WeekdayResult {
  fortuneType: 'weekday';
  weekday: string;
  weekdayEn: string;
  personality: string;
  score: number;
  luckyColor: string;
  advice: string;
}

// Zeller's congruence to find day of week for a given date
function getWeekdayIndex(year: number, month: number, day: number): number {
  // Adjust for Zeller's: January=13 (prev year), February=14 (prev year)
  let m = month;
  let y = year;
  if (m < 3) {
    m += 12;
    y -= 1;
  }
  const k = y % 100;
  const j = Math.floor(y / 100);
  const h = (day + Math.floor((13 * (m + 1)) / 5) + k + Math.floor(k / 4) + Math.floor(j / 4) - 2 * j) % 7;
  // Zeller: 0=Saturday, 1=Sunday, 2=Monday, ...
  // Convert to: 0=Sunday, 1=Monday, ..., 6=Saturday
  return ((h + 6) % 7);
}

export function getWeekdayFortune(birthday: string): WeekdayResult {
  const date = new Date(birthday);
  if (isNaN(date.getTime())) {
    throw new Error('Invalid birthday format');
  }

  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const weekdayIndex = getWeekdayIndex(year, month, day);
  const info = weekdays[weekdayIndex];

  const dateSeed = getDateSeed();
  const baseSeed = `${dateSeed}-weekday-${info.weekdayEn}`;

  return {
    fortuneType: 'weekday',
    weekday: info.weekday,
    weekdayEn: info.weekdayEn,
    personality: info.personality,
    score: seededScore(`${baseSeed}-score`),
    luckyColor: info.luckyColor,
    advice: seededChoice(`${baseSeed}-advice`, weekdayAdvice),
  };
}
