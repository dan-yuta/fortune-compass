import { tenkan, chishi, dayMasterData, shichuuAdvice } from '../data/shichuu-data';
import { getDateSeed, seededChoice, seededScore } from '../utils/seed-random';

export interface ShichuuResult {
  fortuneType: 'shichuu';
  yearPillar: string;
  monthPillar: string;
  dayPillar: string;
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

export function getShichuuFortune(birthday: string): ShichuuResult {
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

  const dateSeed = getDateSeed();
  const baseSeed = `${dateSeed}-shichuu-${dayMasterInfo.tenkan}`;

  return {
    fortuneType: 'shichuu',
    yearPillar,
    monthPillar,
    dayPillar,
    dayMaster: `${dayMasterInfo.tenkan}（${dayMasterInfo.yinYang}の${dayMasterInfo.element}）`,
    element: dayMasterInfo.element,
    personality: dayMasterInfo.personality,
    score: seededScore(`${baseSeed}-score`),
    advice: seededChoice(`${baseSeed}-advice`, shichuuAdvice),
  };
}
