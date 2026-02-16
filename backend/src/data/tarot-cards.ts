export interface TarotCardData {
  number: number;
  name: string;
  nameEn: string;
  meaning: string;
  reversedMeaning: string;
}

export const majorArcana: TarotCardData[] = [
  { number: 0, name: '愚者', nameEn: 'The Fool', meaning: '新しい始まり、自由、冒険心', reversedMeaning: '無謀、不注意、愚かさ' },
  { number: 1, name: '魔術師', nameEn: 'The Magician', meaning: '創造力、意志力、才能の開花', reversedMeaning: '詐欺、未熟、空回り' },
  { number: 2, name: '女教皇', nameEn: 'The High Priestess', meaning: '直感、神秘、内なる声', reversedMeaning: '秘密、表面的、無関心' },
  { number: 3, name: '女帝', nameEn: 'The Empress', meaning: '豊かさ、母性、創造性', reversedMeaning: '過保護、依存、停滞' },
  { number: 4, name: '皇帝', nameEn: 'The Emperor', meaning: '権威、安定、リーダーシップ', reversedMeaning: '横暴、未熟な支配、頑固' },
  { number: 5, name: '教皇', nameEn: 'The Hierophant', meaning: '伝統、教え、精神的な導き', reversedMeaning: '形骸化、束縛、不信' },
  { number: 6, name: '恋人', nameEn: 'The Lovers', meaning: '愛、調和、選択', reversedMeaning: '不調和、誘惑、優柔不断' },
  { number: 7, name: '戦車', nameEn: 'The Chariot', meaning: '勝利、前進、意志の力', reversedMeaning: '暴走、挫折、方向性の喪失' },
  { number: 8, name: '力', nameEn: 'Strength', meaning: '内なる強さ、忍耐、勇気', reversedMeaning: '弱さ、自信喪失、衝動' },
  { number: 9, name: '隠者', nameEn: 'The Hermit', meaning: '内省、探求、知恵', reversedMeaning: '孤立、引きこもり、頑固' },
  { number: 10, name: '運命の輪', nameEn: 'Wheel of Fortune', meaning: '転機、運命の変化、幸運', reversedMeaning: '不運、停滞、悪循環' },
  { number: 11, name: '正義', nameEn: 'Justice', meaning: '公正、バランス、真実', reversedMeaning: '不公正、偏見、不均衡' },
  { number: 12, name: '吊された男', nameEn: 'The Hanged Man', meaning: '試練、忍耐、新しい視点', reversedMeaning: '無駄な犠牲、執着、停滞' },
  { number: 13, name: '死神', nameEn: 'Death', meaning: '変容、終わりと始まり、再生', reversedMeaning: '変化への抵抗、停滞、恐れ' },
  { number: 14, name: '節制', nameEn: 'Temperance', meaning: '調和、バランス、中庸', reversedMeaning: '不均衡、過剰、焦り' },
  { number: 15, name: '悪魔', nameEn: 'The Devil', meaning: '誘惑、束縛、物質主義', reversedMeaning: '解放、覚醒、脱却' },
  { number: 16, name: '塔', nameEn: 'The Tower', meaning: '崩壊、衝撃、解放', reversedMeaning: '変化への恐れ、回避、内なる動揺' },
  { number: 17, name: '星', nameEn: 'The Star', meaning: '希望、インスピレーション、再生', reversedMeaning: '失望、悲観、自信喪失' },
  { number: 18, name: '月', nameEn: 'The Moon', meaning: '不安、幻想、潜在意識', reversedMeaning: '混乱の解消、真実の発見、回復' },
  { number: 19, name: '太陽', nameEn: 'The Sun', meaning: '成功、喜び、活力', reversedMeaning: '一時的な挫折、自信過剰、延期' },
  { number: 20, name: '審判', nameEn: 'Judgement', meaning: '復活、覚醒、新たな使命', reversedMeaning: '後悔、自己否定、停滞' },
  { number: 21, name: '世界', nameEn: 'The World', meaning: '完成、達成、統合', reversedMeaning: '未完成、中途半端、遅延' },
];

export const overallMessages = [
  '過去の冒険心が今の試練を経て、未来に希望の光をもたらすでしょう。カードは、あなたが困難を乗り越える力を持っていることを示しています。',
  'これまでの経験が糧となり、新しいステージへと導かれています。過去を振り返ることで、今進むべき方向が明確になるでしょう。',
  '内なる声に耳を傾けることで、真の道が見えてくるでしょう。静かな時間を作り、自分自身と対話してみてください。',
  '変化の波が訪れています。恐れずに新しい流れに身を委ねましょう。変化の先にこそ、あなたが本当に求めていたものがあります。',
  '過去からの学びが、今日の選択を正しい方向へ導いています。経験は最高の教師です。自信を持って決断してください。',
  '試練は成長の種です。乗り越えた先に大きな喜びが待っています。今の困難は、より強く美しいあなたに生まれ変わるための過程です。',
  '直感を信じて行動する時です。宇宙があなたを後押ししています。理屈では説明できない「何か」を感じたら、それに従ってみましょう。',
  '調和とバランスを大切にすることで、全てがうまく回り始めます。心と体、仕事とプライベートのバランスを見直してみてください。',
  '古いものを手放すことで、新しい可能性が開かれるでしょう。執着を手放した瞬間、本当に大切なものが見えてきます。',
  '心の奥底にある情熱が、あなたを素晴らしい未来へ導きます。その熱い思いを大切にし、自分の信じる道を突き進んでください。',
  '今こそ自分自身と向き合う時です。内省が大きな転機をもたらします。忙しい日々の中でも、自分を見つめ直す時間を確保しましょう。',
  '人との繋がりが幸運の鍵です。感謝の気持ちを忘れずに。周囲の人々との絆を深めることが、最大の幸運を呼び込みます。',
];
