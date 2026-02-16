export interface ZodiacSign {
  sign: string;
  signEn: string;
  element: string;
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
}

export const zodiacSigns: ZodiacSign[] = [
  { sign: '牡羊座', signEn: 'aries', element: '火', startMonth: 3, startDay: 21, endMonth: 4, endDay: 19 },
  { sign: '牡牛座', signEn: 'taurus', element: '地', startMonth: 4, startDay: 20, endMonth: 5, endDay: 20 },
  { sign: '双子座', signEn: 'gemini', element: '風', startMonth: 5, startDay: 21, endMonth: 6, endDay: 21 },
  { sign: '蟹座', signEn: 'cancer', element: '水', startMonth: 6, startDay: 22, endMonth: 7, endDay: 22 },
  { sign: '獅子座', signEn: 'leo', element: '火', startMonth: 7, startDay: 23, endMonth: 8, endDay: 22 },
  { sign: '乙女座', signEn: 'virgo', element: '地', startMonth: 8, startDay: 23, endMonth: 9, endDay: 22 },
  { sign: '天秤座', signEn: 'libra', element: '風', startMonth: 9, startDay: 23, endMonth: 10, endDay: 23 },
  { sign: '蠍座', signEn: 'scorpio', element: '水', startMonth: 10, startDay: 24, endMonth: 11, endDay: 22 },
  { sign: '射手座', signEn: 'sagittarius', element: '火', startMonth: 11, startDay: 23, endMonth: 12, endDay: 21 },
  { sign: '山羊座', signEn: 'capricorn', element: '地', startMonth: 12, startDay: 22, endMonth: 1, endDay: 19 },
  { sign: '水瓶座', signEn: 'aquarius', element: '風', startMonth: 1, startDay: 20, endMonth: 2, endDay: 18 },
  { sign: '魚座', signEn: 'pisces', element: '水', startMonth: 2, startDay: 19, endMonth: 3, endDay: 20 },
];

export const luckyColors = [
  'レッド', 'ブルー', 'グリーン', 'イエロー', 'パープル',
  'オレンジ', 'ピンク', 'ホワイト', 'ゴールド', 'シルバー',
  'ネイビー', 'ブラウン', 'ターコイズ', 'ラベンダー', 'コーラル',
];

export const luckyItems = [
  '観葉植物', 'アクセサリー', '手帳', 'お茶', 'チョコレート',
  'ハンカチ', '本', '花', 'キャンドル', 'パワーストーン',
  'ペン', '写真', '音楽プレイヤー', 'お守り', 'スカーフ',
];

export const zodiacAdvice = [
  '新しい出会いに恵まれる一日です。積極的に行動しましょう。',
  '自分の直感を信じて進んでください。良い結果が待っています。',
  '周囲への感謝の気持ちを忘れずに。人間関係が好転します。',
  '新しいことを始めるのに最適な日です。チャレンジ精神を大切に。',
  '穏やかに過ごすことで、心にゆとりが生まれます。',
  '思い切った決断が吉と出る日です。迷わず行動を。',
  '創造力が高まっています。アイデアを形にしてみましょう。',
  'コミュニケーションを大切にする日です。言葉に力が宿ります。',
  '過去の努力が実を結ぶ予感。自信を持って前に進みましょう。',
  '小さな幸せに気づける日です。日常の中に喜びを見つけて。',
  '目標に向かって着実に進む日です。一歩一歩を大切に。',
  '柔軟な姿勢が運気を引き寄せます。変化を恐れずに。',
  '知識を深めるのに良い日です。学びの時間を取りましょう。',
  '体を動かすことで気分がリフレッシュされます。',
  '大切な人との時間を過ごしましょう。絆が深まります。',
];
