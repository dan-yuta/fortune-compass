export interface GuaInfo {
  guaNumber: number;
  gua: string;
  element: string;
  luckyDirections: string[];
  unluckyDirections: string[];
}

export const guaData: GuaInfo[] = [
  { guaNumber: 1, gua: '坎（かん）', element: '水', luckyDirections: ['南東', '東', '南', '北'], unluckyDirections: ['西', '北西', '南西', '北東'] },
  { guaNumber: 2, gua: '坤（こん）', element: '土', luckyDirections: ['北東', '西', '北西', '南西'], unluckyDirections: ['東', '南東', '南', '北'] },
  { guaNumber: 3, gua: '震（しん）', element: '木', luckyDirections: ['南', '北', '南東', '東'], unluckyDirections: ['南西', '北西', '西', '北東'] },
  { guaNumber: 4, gua: '巽（そん）', element: '木', luckyDirections: ['北', '南', '東', '南東'], unluckyDirections: ['北東', '南西', '北西', '西'] },
  { guaNumber: 6, gua: '乾（けん）', element: '金', luckyDirections: ['西', '北東', '南西', '北西'], unluckyDirections: ['南', '東', '北', '南東'] },
  { guaNumber: 7, gua: '兌（だ）', element: '金', luckyDirections: ['北西', '南西', '北東', '西'], unluckyDirections: ['北', '南東', '東', '南'] },
  { guaNumber: 8, gua: '艮（ごん）', element: '土', luckyDirections: ['南西', '北西', '西', '北東'], unluckyDirections: ['南東', '北', '南', '東'] },
  { guaNumber: 9, gua: '離（り）', element: '火', luckyDirections: ['東', '南東', '北', '南'], unluckyDirections: ['北西', '北東', '南西', '西'] },
];

// Gua number 5 maps to 2 (male) or 8 (female)

export function calculateGuaNumber(year: number, gender: 'male' | 'female'): number {
  // Reduce year to single digit sum
  let sum = 0;
  let y = year;
  while (y > 0) {
    sum += y % 10;
    y = Math.floor(y / 10);
  }
  while (sum >= 10) {
    let temp = 0;
    while (sum > 0) {
      temp += sum % 10;
      sum = Math.floor(sum / 10);
    }
    sum = temp;
  }

  let gua: number;
  if (gender === 'male') {
    gua = (11 - sum) % 9;
    if (gua === 0) gua = 9;
    if (gua === 5) gua = 2;
  } else {
    gua = (sum + 4) % 9;
    if (gua === 0) gua = 9;
    if (gua === 5) gua = 8;
  }

  return gua;
}

export const fengshuiAdvice = [
  '吉方位に向かって仕事をすると、集中力が高まり良い成果が得られます。',
  'リビングを吉方位に配置すると、家族全体の運気が上昇します。',
  '凶方位にはなるべく長時間留まらないようにしましょう。',
  '吉方位に花や観葉植物を置くと、さらに運気がアップします。',
  '寝室の頭の向きを吉方位に合わせると、良い眠りと運気が得られます。',
  '玄関を清潔に保つことで、良い気が家に入ってきます。',
  '吉方位への旅行や外出が、運気を大きく改善させます。',
  '水回りを綺麗にすることで、金運が向上します。',
  '吉方位にデスクを向けると、仕事運・学業運が上昇します。',
  '今日は特に吉方位のエネルギーが強い日です。積極的に活用しましょう。',
  '風水の基本は整理整頓。不要なものを処分して気の流れを良くしましょう。',
  '吉方位からの風を取り入れると、心身ともにリフレッシュできます。',
];
