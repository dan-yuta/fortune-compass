export interface BloodTypeInfo {
  personality: string;
  compatibilityRanking: string[];
}

export const bloodTypeData: Record<string, BloodTypeInfo> = {
  A: {
    personality: '几帳面で真面目、協調性が高い。責任感が強く、周囲への気配りができるタイプです。',
    compatibilityRanking: ['A', 'AB', 'O', 'B'],
  },
  B: {
    personality: 'マイペースで自由奔放、好奇心旺盛。独自の感性を持ち、クリエイティブなタイプです。',
    compatibilityRanking: ['B', 'AB', 'O', 'A'],
  },
  O: {
    personality: 'おおらかでリーダーシップがある。情熱的で、目標に向かって突き進むタイプです。',
    compatibilityRanking: ['O', 'A', 'B', 'AB'],
  },
  AB: {
    personality: '冷静で合理的、二面性のある不思議な魅力の持ち主。バランス感覚に優れたタイプです。',
    compatibilityRanking: ['AB', 'B', 'A', 'O'],
  },
};

export const bloodTypeAdvice = [
  '周囲との調和を大切にする一日です。笑顔が幸運を引き寄せます。',
  '自分の気持ちに正直に行動しましょう。本音が良い結果を生みます。',
  '新しい挑戦に最適な日です。一歩踏み出す勇気が道を開きます。',
  '身の回りの整理整頓で運気アップ。スッキリした環境が幸運を呼びます。',
  'リラックスした時間が大切です。心の余裕が良い判断を生みます。',
  '人との会話から大切なヒントが得られそうです。耳を傾けて。',
  '直感が冴える日です。ピンときたことは即行動に移しましょう。',
  '感謝の気持ちを伝えることで、人間関係がさらに良くなります。',
  '体を動かすことで気分がリフレッシュ。軽い運動がおすすめです。',
  'クリエイティブな活動にツキあり。趣味の時間を大切にしましょう。',
  '堅実な行動が実を結ぶ日です。コツコツ進めることが大切。',
  '大切な人への連絡が幸運の鍵。久しぶりの人に声をかけてみて。',
];
