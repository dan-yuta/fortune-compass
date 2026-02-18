import { seededScore } from '../utils/seed-random';

export interface TrendDay {
  date: string;
  dayLabel: string;
  overall: number;
  love: number;
  work: number;
  money: number;
}

export interface TrendsResult {
  fortuneType: 'trends';
  days: TrendDay[];
  bestDay: string;
  worstDay: string;
  advice: string;
}

const trendsAdvice = [
  '運勢の波を活かして、ピークの日に重要な決断を行いましょう。',
  '低調な日は無理をせず、準備と充電の時間に当てましょう。',
  '全体的に安定した運勢です。日々の積み重ねが大きな成果につながります。',
  '運気の上昇トレンドが見えます。この流れに乗って積極的に行動しましょう。',
  '変動が大きい週です。柔軟に対応することで、チャンスを掴めるでしょう。',
  '恋愛運が特に好調な期間です。大切な人との時間を優先しましょう。',
  '仕事運の波をうまく利用して、重要なタスクを運気の高い日に集中させましょう。',
  '金運に注目の週です。計画的な行動が財運を高めます。',
];

export function getTrendsFortune(
  birthday: string,
  name?: string,
  bloodType?: string,
): TrendsResult {
  const date = new Date(birthday);
  if (isNaN(date.getTime())) {
    throw new Error('Invalid birthday format');
  }

  const today = new Date();
  const days: TrendDay[] = [];
  const dayLabels = ['3日前', '2日前', '1日前', '今日', '1日後', '2日後', '3日後'];

  let bestScore = 0;
  let worstScore = 6;
  let bestDay = '';
  let worstDay = '';

  for (let offset = -3; offset <= 3; offset++) {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + offset);
    const dateStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;
    const baseSeed = `${dateStr}-trends-${birthday}-${name || ''}-${bloodType || ''}`;

    const overall = seededScore(`${baseSeed}-overall`);
    const love = seededScore(`${baseSeed}-love`);
    const work = seededScore(`${baseSeed}-work`);
    const money = seededScore(`${baseSeed}-money`);

    if (overall > bestScore) {
      bestScore = overall;
      bestDay = dayLabels[offset + 3];
    }
    if (overall < worstScore) {
      worstScore = overall;
      worstDay = dayLabels[offset + 3];
    }

    days.push({
      date: dateStr,
      dayLabel: dayLabels[offset + 3],
      overall,
      love,
      work,
      money,
    });
  }

  // Select advice based on overall pattern
  const avgScore = days.reduce((sum, d) => sum + d.overall, 0) / days.length;
  const adviceIndex = Math.floor(avgScore * 1.5) % trendsAdvice.length;

  return {
    fortuneType: 'trends',
    days,
    bestDay,
    worstDay,
    advice: trendsAdvice[adviceIndex],
  };
}
