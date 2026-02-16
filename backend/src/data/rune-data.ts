export interface RuneInfo {
  name: string;
  nameEn: string;
  meaning: string;
  reversedMeaning: string;
  canReverse: boolean;
}

export const runes: RuneInfo[] = [
  { name: 'フェフ', nameEn: 'Fehu', meaning: '財産と豊かさの象徴。物質的な恵みが訪れる兆しです。努力の成果が実を結びます。', reversedMeaning: '浪費や損失に注意。お金の使い方を見直す時期です。', canReverse: true },
  { name: 'ウルズ', nameEn: 'Uruz', meaning: '力強さと健康を示します。困難を乗り越える内なるパワーが湧いてきます。', reversedMeaning: '体力の低下や気力の衰えに注意。無理をしすぎないように。', canReverse: true },
  { name: 'スリサズ', nameEn: 'Thurisaz', meaning: '防御と保護の力。障害を打ち破る力が与えられています。', reversedMeaning: '衝動的な行動は避けましょう。冷静さが求められています。', canReverse: true },
  { name: 'アンスズ', nameEn: 'Ansuz', meaning: '知恵とコミュニケーションの象徴。重要なメッセージを受け取るでしょう。', reversedMeaning: '誤解やコミュニケーション不足に注意。言葉を慎重に選びましょう。', canReverse: true },
  { name: 'ライゾ', nameEn: 'Raidho', meaning: '旅と移動を象徴。新しい道が開け、人生が前に進みます。', reversedMeaning: '計画の見直しが必要です。急がば回れの精神で。', canReverse: true },
  { name: 'ケナズ', nameEn: 'Kenaz', meaning: '知識の光と創造力。新しいアイデアやインスピレーションが湧きます。', reversedMeaning: '視野が狭くなっています。新しい視点を取り入れましょう。', canReverse: true },
  { name: 'ギューフ', nameEn: 'Gebo', meaning: '贈り物とパートナーシップ。人との絆が深まり、幸運な出会いがあります。', reversedMeaning: '', canReverse: false },
  { name: 'ウンジョ', nameEn: 'Wunjo', meaning: '喜びと幸福の象徴。願いが叶い、満足感に包まれる時です。', reversedMeaning: '過度な期待は禁物。現実を受け入れる柔軟さが必要です。', canReverse: true },
  { name: 'ハガラズ', nameEn: 'Hagalaz', meaning: '試練と浄化を示します。困難の後に新たな始まりが訪れます。', reversedMeaning: '', canReverse: false },
  { name: 'ナウシズ', nameEn: 'Nauthiz', meaning: '忍耐と必要性。今は耐える時ですが、この経験が成長につながります。', reversedMeaning: '自分を追い詰めすぎないで。助けを求めることも大切です。', canReverse: true },
  { name: 'イサ', nameEn: 'Isa', meaning: '静止と集中。立ち止まって内面を見つめる時です。答えは自分の中にあります。', reversedMeaning: '', canReverse: false },
  { name: 'イェラ', nameEn: 'Jera', meaning: '収穫と循環。過去の努力が実を結ぶ時期です。忍耐の成果を享受しましょう。', reversedMeaning: '', canReverse: false },
  { name: 'エイワズ', nameEn: 'Eihwaz', meaning: '変容と再生。大きな変化が訪れますが、それは成長のためです。', reversedMeaning: '', canReverse: false },
  { name: 'ペルソ', nameEn: 'Perthro', meaning: '運命と神秘。隠されていた真実が明らかになります。直感を信じましょう。', reversedMeaning: '秘密に注意。隠し事は逆効果になるかもしれません。', canReverse: true },
  { name: 'アルジズ', nameEn: 'Algiz', meaning: '守護と保護。強い守りの力に包まれています。安心して前に進めます。', reversedMeaning: '警戒心が薄れています。周囲の状況に注意を払いましょう。', canReverse: true },
  { name: 'ソウェル', nameEn: 'Sowilo', meaning: '太陽と勝利。エネルギーに満ち、成功が約束されています。', reversedMeaning: '', canReverse: false },
  { name: 'ティワズ', nameEn: 'Tiwaz', meaning: '正義と勇気。正しい道を進む勇気が与えられています。リーダーシップを発揮して。', reversedMeaning: '自信の喪失に注意。自分の判断を信じましょう。', canReverse: true },
  { name: 'ベルカナ', nameEn: 'Berkano', meaning: '成長と誕生。新しい始まりの兆し。育む心が幸運を引き寄せます。', reversedMeaning: '成長の停滞に注意。環境を変えてみることも一つの方法です。', canReverse: true },
  { name: 'エワズ', nameEn: 'Ehwaz', meaning: '信頼とチームワーク。パートナーとの協力が大きな力を生みます。', reversedMeaning: '信頼関係に亀裂が入らないよう注意。誠実さを忘れずに。', canReverse: true },
  { name: 'マナズ', nameEn: 'Mannaz', meaning: '自己認識と人間性。自分自身を深く理解することで、真の力が発揮されます。', reversedMeaning: '自己中心的になっていないか振り返りましょう。他者への配慮を。', canReverse: true },
  { name: 'ラグズ', nameEn: 'Laguz', meaning: '直感と感情の流れ。心の声に耳を傾けると、正しい道が見えてきます。', reversedMeaning: '感情に振り回されないよう注意。冷静さを保ちましょう。', canReverse: true },
  { name: 'イングズ', nameEn: 'Ingwaz', meaning: '完成と達成。一つのサイクルが完了し、新たなステージへ進みます。', reversedMeaning: '', canReverse: false },
  { name: 'ダガズ', nameEn: 'Dagaz', meaning: '夜明けと変革。暗闇の後に光が差します。大きな転換点が近づいています。', reversedMeaning: '', canReverse: false },
  { name: 'オシラ', nameEn: 'Othala', meaning: '遺産と故郷。ルーツを大切にすることで、揺るぎない基盤が築けます。', reversedMeaning: '古い考えに固執していませんか。新しい価値観も受け入れて。', canReverse: true },
];

export const runeMessages = [
  '3つのルーンが示す流れに身を任せましょう。過去から学び、現在を生き、未来を信じることが大切です。',
  'ルーンの導きは、あなたの内なる力を呼び覚まします。直感を信じて行動しましょう。',
  '古代の知恵があなたに語りかけています。メッセージを心に留め、日々の行動に活かしましょう。',
  'ルーンが示す道は一つではありません。柔軟な心で、最善の選択をしていきましょう。',
  '3枚のルーンの繋がりに注目してください。そこにあなたへの重要なメッセージが隠されています。',
  'ルーンの力があなたを守り導いています。恐れることなく前に進みましょう。',
  '変化を恐れず、ルーンの示す方向へ歩みを進めましょう。新しい扉が開かれます。',
  'ルーンはあなたの可能性を示しています。その力を信じ、自分らしく生きましょう。',
];
