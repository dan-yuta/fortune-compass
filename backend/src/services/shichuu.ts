import { tenkan, chishi, dayMasterData, shichuuAdvice } from '../data/shichuu-data';
import { getDateSeed, seededChoice, seededScore } from '../utils/seed-random';

export interface ShichuuResult {
  fortuneType: 'shichuu';
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

function getYearPillar(year: number): string {
  const tenkanIndex = (year - 4) % 10;
  const chishiIndex = (year - 4) % 12;
  return tenkan[(tenkanIndex + 10) % 10] + chishi[(chishiIndex + 12) % 12];
}

function getMonthPillar(year: number, month: number): string {
  // Month stems depend on year stem
  const yearTenkanIndex = (year - 4) % 10;
  // Formula: monthTenkan = (yearTenkan * 2 + month) % 10
  const monthTenkanIndex = ((yearTenkanIndex % 5) * 2 + month) % 10;
  // Month branch: fixed mapping (month 1 = 寅, month 2 = 卯, etc.)
  const monthChishiIndex = (month + 1) % 12;
  return tenkan[monthTenkanIndex] + chishi[monthChishiIndex];
}

function getDayPillar(year: number, month: number, day: number): string {
  // Simplified calculation using Julian Day Number
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  const jdn = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;

  // Day pillar cycles every 60 days
  const cycle = (jdn + 9) % 60;
  const tenkanIndex = cycle % 10;
  const chishiIndex = cycle % 12;
  return tenkan[(tenkanIndex + 10) % 10] + chishi[(chishiIndex + 12) % 12];
}

/**
 * Calculate the hour pillar (時柱) from day tenkan index and hour.
 * Hour branch: 23-1=子, 1-3=丑, 3-5=寅, ... (2-hour intervals)
 * Hour stem: derived from day stem using the formula: (dayTenkanIndex % 5) * 2 + hourBranchIndex
 */
function getHourPillar(dayTenkanIndex: number, hour: number): string {
  // Map hour to branch index (子=0, 丑=1, ..., 亥=11)
  // 23:00-00:59=子(0), 01:00-02:59=丑(1), ..., 21:00-22:59=亥(11)
  const hourBranchIndex = hour === 23 ? 0 : Math.floor((hour + 1) / 2);
  const hourTenkanIndex = ((dayTenkanIndex % 5) * 2 + hourBranchIndex) % 10;
  return tenkan[hourTenkanIndex] + chishi[hourBranchIndex];
}

export function getShichuuFortune(birthday: string, birthTime?: string): ShichuuResult {
  const date = new Date(birthday);
  if (isNaN(date.getTime())) {
    throw new Error('Invalid birthday format');
  }

  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();

  const yearPillar = getYearPillar(year);
  const monthPillar = getMonthPillar(year, month);
  const dayPillar = getDayPillar(year, month, day);

  // Day master is the tenkan of the day pillar
  const dayCycle = (((() => {
    const a = Math.floor((14 - month) / 12);
    const y = year + 4800 - a;
    const m = month + 12 * a - 3;
    return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  })() + 9) % 60);
  const dayTenkanIndex = ((dayCycle % 10) + 10) % 10;
  const dayMasterInfo = dayMasterData[dayTenkanIndex];

  // Calculate hour pillar if birthTime is provided
  let hourPillar: string | undefined;
  if (birthTime) {
    const timeParts = birthTime.split(':');
    if (timeParts.length >= 2) {
      const hour = parseInt(timeParts[0], 10);
      if (!isNaN(hour) && hour >= 0 && hour <= 23) {
        hourPillar = getHourPillar(dayTenkanIndex, hour);
      }
    }
  }

  const dateSeed = getDateSeed();
  const baseSeed = `${dateSeed}-shichuu-${dayMasterInfo.tenkan}`;

  return {
    fortuneType: 'shichuu',
    yearPillar,
    monthPillar,
    dayPillar,
    hourPillar,
    dayMaster: `${dayMasterInfo.tenkan}（${dayMasterInfo.yinYang}の${dayMasterInfo.element}）`,
    element: dayMasterInfo.element,
    personality: dayMasterInfo.personality,
    score: seededScore(`${baseSeed}-score`),
    advice: seededChoice(`${baseSeed}-advice`, shichuuAdvice),
  };
}
