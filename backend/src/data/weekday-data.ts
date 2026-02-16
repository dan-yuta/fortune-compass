export interface WeekdayInfo {
  weekday: string;
  weekdayEn: string;
  personality: string;
  luckyColor: string;
}

export const weekdays: WeekdayInfo[] = [
  { weekday: '日曜日', weekdayEn: 'Sunday', personality: '明るく楽観的で、人を惹きつける華やかなオーラを持っています。リーダーシップを発揮し、周囲を照らす太陽のような存在です。創造力に富み、自分の信じた道を進む強さがあります。', luckyColor: 'ゴールド' },
  { weekday: '月曜日', weekdayEn: 'Monday', personality: '感受性が豊かで、繊細な心を持っています。直感力に優れ、人の気持ちを察する能力が高いです。想像力が豊かで、芸術的な才能に恵まれています。', luckyColor: 'シルバー' },
  { weekday: '火曜日', weekdayEn: 'Tuesday', personality: '情熱的で行動力があり、何事にも全力で取り組みます。正義感が強く、困っている人を放っておけない優しさがあります。チャレンジ精神旺盛です。', luckyColor: 'レッド' },
  { weekday: '水曜日', weekdayEn: 'Wednesday', personality: '知性的で好奇心旺盛、コミュニケーション能力に長けています。多才で器用、様々な分野で才能を発揮します。柔軟な思考で問題解決が得意です。', luckyColor: 'グリーン' },
  { weekday: '木曜日', weekdayEn: 'Thursday', personality: '寛大で楽観的、人生を楽しむ才能があります。高い理想を持ち、向上心に溢れています。人望が厚く、自然とリーダーの役割を任されます。', luckyColor: 'パープル' },
  { weekday: '金曜日', weekdayEn: 'Friday', personality: '愛情深く、美的センスに優れています。人との調和を大切にし、周囲に安心感を与えます。芸術や美しいものに対する鋭い感性を持っています。', luckyColor: 'ピンク' },
  { weekday: '土曜日', weekdayEn: 'Saturday', personality: '堅実で忍耐力があり、責任感が強いです。地道な努力を続けることができ、長期的な目標を確実に達成します。信頼される人格の持ち主です。', luckyColor: 'ブラウン' },
];

export const weekdayAdvice = [
  '生まれ曜日のエネルギーが高まっています。自分らしく過ごすことで運気が上昇します。',
  '曜日の守護力があなたを後押ししています。自信を持って行動しましょう。',
  '今日は生まれ曜日の特性を活かせる場面が訪れます。チャンスを逃さないで。',
  '曜日のパワーがコミュニケーション運を高めています。大切な人と対話しましょう。',
  '生まれ曜日の影響で創造力が高まっています。新しいアイデアを形にしましょう。',
  '曜日の守護が金運を高めています。計画的な行動が吉と出ます。',
  '生まれ曜日のエネルギーが健康運を高めています。体を動かすと良いでしょう。',
];
