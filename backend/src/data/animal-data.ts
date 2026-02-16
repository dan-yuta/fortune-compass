export interface AnimalCharacter {
  number: number;
  animal: string;
  character: string;
  color: string;
  group: 'SUN' | 'EARTH' | 'MOON';
  personality: string;
  compatibility: string;
}

// 動物占い 60キャラクター（キャラナンバー1-60）
// 個性心理學に基づく公式キャラクターリスト
export const animalCharacters: AnimalCharacter[] = [
  // 1-10
  { number: 1, animal: 'チータ', character: '長距離ランナーのチータ', color: 'イエロー', group: 'SUN', personality: '持久力があり、長期的な目標に向かって粘り強く走り続けることができるタイプです。瞬発力よりも継続力が武器で、コツコツと努力を重ねて大きな成果を手にします。', compatibility: '落ち着きのあるペガサス' },
  { number: 2, animal: 'たぬき', character: '社交家のたぬき', color: 'グリーン', group: 'MOON', personality: '人付き合いが得意で、幅広い交友関係を持つ社交の達人です。どんな場でも場を和ませるユーモアがあり、愛されキャラとして周囲に親しまれています。', compatibility: '正直なこじか' },
  { number: 3, animal: '猿', character: '落ち着きのない猿', color: 'レッド', group: 'EARTH', personality: '好奇心旺盛で常に動き回るエネルギッシュなタイプです。じっとしているのが苦手で、新しいことに次々と興味を持ちます。器用で何でもそつなくこなせる多才な人です。', compatibility: '我が道を行くライオン' },
  { number: 4, animal: 'コアラ', character: 'フットワークの軽いコアラ', color: 'オレンジ', group: 'EARTH', personality: 'のんびりした外見とは裏腹に、フットワークが軽く行動的なタイプです。興味を持ったことにはすぐに飛びつく好奇心の持ち主で、意外と行動派な一面を持っています。', compatibility: '統率力のあるライオン' },
  { number: 5, animal: '黒ひょう', character: '面倒見のいい黒ひょう', color: 'ブラウン', group: 'MOON', personality: '周囲への気配りが自然にでき、困っている人を放っておけない面倒見の良さがあります。クールな外見の中に温かい心を持ち、信頼される存在です。', compatibility: '長距離ランナーのチータ' },
  { number: 6, animal: '虎', character: '愛情あふれる虎', color: 'ブラック', group: 'EARTH', personality: '深い愛情で周囲を包み込む温かい人柄の持ち主です。大切な人のためなら全力で尽くし、その献身的な姿勢が多くの人を惹きつけます。', compatibility: '社交家のたぬき' },
  { number: 7, animal: 'チータ', character: '全力疾走するチータ', color: 'ゴールド', group: 'SUN', personality: '目標に向かって全速力で突っ走る情熱家です。スタートダッシュが得意で、やると決めたらすぐに行動に移す決断力があります。スピード感のある仕事ぶりで周囲を驚かせます。', compatibility: '強靭な翼をもつペガサス' },
  { number: 8, animal: 'たぬき', character: '磨き上げられたたぬき', color: 'シルバー', group: 'MOON', personality: '努力を積み重ねて自分を磨き上げてきた洗練されたタイプです。見た目も中身も上品で、品格のある振る舞いが自然にできます。', compatibility: '強い意志をもったこじか' },
  { number: 9, animal: '猿', character: '大きな志をもった猿', color: 'ブルー', group: 'EARTH', personality: '高い目標を掲げ、それに向かって努力を惜しまない志の高い人です。頭の回転が速く、戦略的に物事を進める知性派でもあります。', compatibility: 'デリケートなゾウ' },
  { number: 10, animal: 'コアラ', character: '母性豊かなコアラ', color: 'パープル', group: 'EARTH', personality: '包容力があり、周囲の人を優しく包み込む母性的な存在です。困っている人にそっと手を差し伸べる思いやりの持ち主で、相談相手として最適です。', compatibility: 'リーダーとなるゾウ' },

  // 11-20
  { number: 11, animal: 'こじか', character: '正直なこじか', color: 'イエロー', group: 'MOON', personality: '嘘がつけない素直で純粋な心の持ち主です。天真爛漫で飾らない性格が多くの人を惹きつけます。周囲の人を自然と笑顔にする不思議な力があります。', compatibility: '全力疾走するチータ' },
  { number: 12, animal: 'ゾウ', character: '人気者のゾウ', color: 'グリーン', group: 'SUN', personality: '周囲から愛される人気者で、その場にいるだけで雰囲気が明るくなります。面倒見が良く、誰にでも分け隔てなく接する大らかさが魅力です。', compatibility: '磨き上げられたたぬき' },
  { number: 13, animal: '狼', character: 'ネアカの狼', color: 'レッド', group: 'EARTH', personality: '一匹狼的な面がありながらも、根は明るく前向きなタイプです。独自の世界観を持ちつつ、ユーモアのセンスで周囲を楽しませます。', compatibility: '波乱に満ちたペガサス' },
  { number: 14, animal: 'ひつじ', character: '協調性のないひつじ', color: 'オレンジ', group: 'MOON', personality: '自分の信念を大切にし、周囲に流されない芯の強さを持っています。「協調性がない」と見られることもありますが、それは自分の意見をしっかり持っている証です。', compatibility: '落ち着きのない猿' },
  { number: 15, animal: '猿', character: 'どっしりとした猿', color: 'ブラウン', group: 'EARTH', personality: '猿の器用さに加えて、落ち着きと安定感を兼ね備えたタイプです。物事に動じない胆力があり、頼りがいのある存在として周囲から信頼されています。', compatibility: '感情的なライオン' },
  { number: 16, animal: 'コアラ', character: 'コアラのなかのコアラ', color: 'ブラック', group: 'EARTH', personality: 'コアラの特徴を最も強く持つ純粋なコアラタイプです。のんびりマイペースで、自分のペースを崩さない穏やかさがあります。癒しのオーラで周囲をリラックスさせます。', compatibility: '傷つきやすいライオン' },
  { number: 17, animal: 'こじか', character: '強い意志をもったこじか', color: 'ゴールド', group: 'MOON', personality: '可愛らしい見た目に反して、強い意志と決断力を持っています。一度決めたことは最後までやり遂げる粘り強さがあり、周囲を驚かせることもあります。', compatibility: '磨き上げられたたぬき' },
  { number: 18, animal: 'ゾウ', character: 'デリケートなゾウ', color: 'シルバー', group: 'SUN', personality: '大きな体に繊細な心を持つ感受性豊かなタイプです。周囲の変化に敏感で、細やかな気配りができます。優しさの中に芯の強さを秘めています。', compatibility: '大きな志をもった猿' },
  { number: 19, animal: '狼', character: '放浪の狼', color: 'ブルー', group: 'EARTH', personality: '自由を愛し、束縛を嫌う放浪者タイプです。独自の価値観で生き、型にはまらない発想ができます。一匹狼でありながらも、大切な人には深い愛情を注ぎます。', compatibility: '優雅なペガサス' },
  { number: 20, animal: 'ひつじ', character: '物静かなひつじ', color: 'パープル', group: 'MOON', personality: '穏やかで控えめな佇まいの中に、深い思考力を秘めています。静かに物事を観察し、本質を見抜く力があります。信頼できる相談相手として周囲から慕われます。', compatibility: '大きな志をもった猿' },

  // 21-30
  { number: 21, animal: 'ペガサス', character: '落ち着きのあるペガサス', color: 'イエロー', group: 'SUN', personality: 'ペガサスの自由さに安定感が加わったバランスの取れたタイプです。直感力に優れながらも、地に足のついた判断ができます。穏やかなオーラで周囲に安心感を与えます。', compatibility: '長距離ランナーのチータ' },
  { number: 22, animal: 'ペガサス', character: '強靭な翼をもつペガサス', color: 'グリーン', group: 'SUN', personality: '困難な状況でも力強く飛び立てるタフな精神力の持ち主です。逆境に強く、プレッシャーがかかるほど実力を発揮します。大きな夢を実現する力があります。', compatibility: '全力疾走するチータ' },
  { number: 23, animal: 'ひつじ', character: '無邪気なひつじ', color: 'レッド', group: 'MOON', personality: '天真爛漫で純粋な心を持つ愛される存在です。素直な感情表現が魅力で、周囲を和ませる笑顔の持ち主です。子どものような好奇心で日々を楽しみます。', compatibility: 'ネアカの狼' },
  { number: 24, animal: '狼', character: 'クリエイティブな狼', color: 'オレンジ', group: 'EARTH', personality: '独創的な発想力を持つクリエイタータイプです。既成概念にとらわれず、ユニークなアイデアを次々と生み出します。芸術的センスに優れた表現者です。', compatibility: '華やかなこじか' },
  { number: 25, animal: '狼', character: '穏やかな狼', color: 'ブラウン', group: 'EARTH', personality: '狼の独立心を持ちながらも、穏やかで優しい人柄です。争いを好まず、調和を大切にします。一人の時間と人との交流のバランスを上手に取れるタイプです。', compatibility: 'しっかり者のこじか' },
  { number: 26, animal: 'ひつじ', character: '粘り強いひつじ', color: 'ブラック', group: 'MOON', personality: '優しい見た目の裏に強い忍耐力を秘めています。困難な状況でも諦めず、コツコツと努力を続けることができます。目標達成まで粘り強く取り組む頑張り屋です。', compatibility: 'クリエイティブな狼' },
  { number: 27, animal: 'ペガサス', character: '波乱に満ちたペガサス', color: 'ゴールド', group: 'SUN', personality: '波乱万丈の人生を自ら選び、刺激的な毎日を楽しむタイプです。退屈を嫌い、常に新しいチャレンジを求めます。その行動力と発想力で周囲を驚かせます。', compatibility: 'ネアカの狼' },
  { number: 28, animal: 'ペガサス', character: '優雅なペガサス', color: 'シルバー', group: 'SUN', personality: '品格と優雅さを兼ね備えた魅力的な人物です。美意識が高く、生活の隅々にまで美しさを追求します。穏やかな物腰で人を安心させる落ち着きがあります。', compatibility: '放浪の狼' },
  { number: 29, animal: 'ひつじ', character: 'チャレンジ精神旺盛なひつじ', color: 'ブルー', group: 'MOON', personality: 'ひつじの穏やかさに冒険心が加わった積極的なタイプです。新しいことへの挑戦を楽しみ、失敗を恐れず前に進む勇気があります。', compatibility: '穏やかな狼' },
  { number: 30, animal: '狼', character: '順応性のある狼', color: 'パープル', group: 'EARTH', personality: '狼の独立心を保ちながらも、環境への適応力に優れたタイプです。どんな状況でも柔軟に対応でき、自分のスタイルを崩さずに周囲と調和できます。', compatibility: 'チャレンジ精神旺盛なひつじ' },

  // 31-40
  { number: 31, animal: 'ゾウ', character: 'リーダーとなるゾウ', color: 'イエロー', group: 'SUN', personality: '生まれながらのリーダー気質で、周囲を力強く導く存在です。責任感が強く、任された役割は確実にやり遂げます。包容力のある頼もしいリーダーです。', compatibility: '母性豊かなコアラ' },
  { number: 32, animal: 'こじか', character: 'しっかり者のこじか', color: 'グリーン', group: 'MOON', personality: '可愛らしい外見に反して、しっかりとした考えを持つ堅実なタイプです。計画性があり、着実に目標を達成していきます。頼りになる存在として周囲から信頼されています。', compatibility: '穏やかな狼' },
  { number: 33, animal: 'コアラ', character: '活動的なコアラ', color: 'レッド', group: 'EARTH', personality: 'コアラのイメージを覆すほどアクティブで行動的なタイプです。興味を持ったことにはどんどん挑戦し、その行動力で周囲を驚かせます。', compatibility: 'まっしぐらに突き進むゾウ' },
  { number: 34, animal: '猿', character: '気分屋の猿', color: 'オレンジ', group: 'EARTH', personality: 'その日の気分によって行動が変わるムードメーカーです。好奇心が旺盛で、常に新しいことに興味を持ちます。器用で何でもそつなくこなせる多才な人です。', compatibility: '華やかなこじか' },
  { number: 35, animal: 'ひつじ', character: '頼られると嬉しいひつじ', color: 'ブラウン', group: 'MOON', personality: '人の役に立つことに喜びを感じるタイプです。頼られると張り切って全力で応えようとします。面倒見が良く、周囲から頼りにされる存在です。', compatibility: '活動的なコアラ' },
  { number: 36, animal: '狼', character: '好感のもたれる狼', color: 'ブラック', group: 'EARTH', personality: '狼の独立心を持ちながらも、誰からも好かれる親しみやすさがあります。自然体でありながら周囲への配慮もでき、バランス感覚に優れています。', compatibility: '頼られると嬉しいひつじ' },
  { number: 37, animal: 'ゾウ', character: 'まっしぐらに突き進むゾウ', color: 'ゴールド', group: 'SUN', personality: '目標に向かって一直線に突き進む力強い行動派です。迷いなく前に進む姿勢が周囲に勇気を与えます。一度決めたことは何があってもやり遂げる意志の強さがあります。', compatibility: '活動的なコアラ' },
  { number: 38, animal: 'こじか', character: '華やかなこじか', color: 'シルバー', group: 'MOON', personality: '天性の華やかさで場を明るくする存在です。社交的で人を惹きつける魅力があり、どんな場所でも注目を集めます。純粋な心と華やかなオーラが魅力です。', compatibility: 'クリエイティブな狼' },
  { number: 39, animal: 'コアラ', character: '夢とロマンのコアラ', color: 'ブルー', group: 'EARTH', personality: '夢見がちなロマンチストで、美しいものや感動的な出来事に心を奪われます。想像力が豊かで、クリエイティブな才能を秘めています。', compatibility: 'リーダーとなるゾウ' },
  { number: 40, animal: '猿', character: '尽くす猿', color: 'パープル', group: 'EARTH', personality: '大切な人のために惜しみなく尽くす献身的なタイプです。器用さを活かして周囲をサポートし、縁の下の力持ちとして活躍します。', compatibility: '人気者のゾウ' },

  // 41-50
  { number: 41, animal: 'たぬき', character: '大器晩成のたぬき', color: 'イエロー', group: 'MOON', personality: '若い頃は目立たなくても、年齢を重ねるごとに魅力が増していくタイプです。じっくりと経験を積み上げ、やがて大きな花を咲かせます。', compatibility: '足腰の強いチータ' },
  { number: 42, animal: 'チータ', character: '足腰の強いチータ', color: 'グリーン', group: 'SUN', personality: 'スピードだけでなく、安定した土台を持つバランスの取れたチータです。持久力があり、長期戦にも強い粘りを見せます。', compatibility: '大器晩成のたぬき' },
  { number: 43, animal: '虎', character: '動きまわる虎', color: 'レッド', group: 'EARTH', personality: 'じっとしていられない活動的な虎です。好奇心旺盛で行動力があり、常に新しい刺激を求めて動き回ります。そのエネルギッシュさで周囲を巻き込みます。', compatibility: '面倒見のいい黒ひょう' },
  { number: 44, animal: '黒ひょう', character: '情熱的な黒ひょう', color: 'オレンジ', group: 'MOON', personality: 'クールな外見の中に熱い情熱を秘めたタイプです。ここぞという場面で内に秘めた炎を燃やし、圧倒的な成果を出します。', compatibility: '動きまわる虎' },
  { number: 45, animal: 'コアラ', character: 'サービス精神旺盛なコアラ', color: 'ブラウン', group: 'EARTH', personality: '人を喜ばせることが大好きなサービス精神の塊です。おもてなし上手で、周囲を楽しませるアイデアが次々と浮かんできます。', compatibility: '感情豊かな黒ひょう' },
  { number: 46, animal: '猿', character: '守りの猿', color: 'ブラック', group: 'EARTH', personality: '大切なものを守る力に優れた防御型の猿です。慎重で用心深く、リスク管理が得意です。安定を重視し、確実な道を選んで進みます。', compatibility: '気どらない黒ひょう' },
  { number: 47, animal: 'たぬき', character: '人間味あふれるたぬき', color: 'ゴールド', group: 'MOON', personality: '人情に厚く、義理人情を大切にする心の温かい人です。飾らない自然体の人柄が多くの人を惹きつけます。困った人を見過ごせない優しさがあります。', compatibility: '品格のあるチータ' },
  { number: 48, animal: 'チータ', character: '品格のあるチータ', color: 'シルバー', group: 'SUN', personality: 'スピードと品格を兼ね備えたエレガントなチータです。行動力がありながらも上品な振る舞いができ、周囲から一目置かれる存在です。', compatibility: '人間味あふれるたぬき' },
  { number: 49, animal: '虎', character: '楽天的な虎', color: 'ブルー', group: 'EARTH', personality: '虎の力強さに明るい楽天性が加わったポジティブなタイプです。困難な状況でも前向きな姿勢を崩さず、その明るさで周囲に元気を与えます。', compatibility: '情熱的な黒ひょう' },
  { number: 50, animal: '黒ひょう', character: '落ち込みの激しい黒ひょう', color: 'パープル', group: 'MOON', personality: '感受性が豊かで、喜びも悲しみも人一倍深く感じるタイプです。繊細な感性は芸術的な才能にもつながり、創造性に優れています。', compatibility: '楽天的な虎' },

  // 51-60
  { number: 51, animal: 'ライオン', character: '我が道を行くライオン', color: 'イエロー', group: 'SUN', personality: '自分の信念を貫き、我が道を堂々と歩む王者の風格を持っています。他人に流されず、独自の判断で行動できる芯の強さがあります。', compatibility: '順応性のある狼' },
  { number: 52, animal: 'ライオン', character: '統率力のあるライオン', color: 'グリーン', group: 'SUN', personality: '生まれながらのリーダーで、周囲を自然とまとめ上げる統率力があります。カリスマ性があり、その言葉には説得力があります。責任感も強いです。', compatibility: 'フットワークの軽いコアラ' },
  { number: 53, animal: '黒ひょう', character: '感情豊かな黒ひょう', color: 'レッド', group: 'MOON', personality: '豊かな感情表現が魅力的なタイプです。喜怒哀楽がはっきりしていて、その素直な感情が周囲の心を動かします。共感力に優れた感性の持ち主です。', compatibility: 'サービス精神旺盛なコアラ' },
  { number: 54, animal: '虎', character: 'ゆったりとした悠然の虎', color: 'オレンジ', group: 'EARTH', personality: '虎の力強さを持ちながらも、ゆったりとした余裕のある佇まいが特徴です。急がず焦らず、自分のペースで物事を進める大物感があります。', compatibility: '感情豊かな黒ひょう' },
  { number: 55, animal: '虎', character: 'パワフルな虎', color: 'ブラウン', group: 'EARTH', personality: '圧倒的なパワーとエネルギーの持ち主です。どんな困難も力で押し切る強さがあり、その存在感で周囲を圧倒します。行動力と実行力が抜群です。', compatibility: '束縛を嫌う黒ひょう' },
  { number: 56, animal: '黒ひょう', character: '気どらない黒ひょう', color: 'ブラック', group: 'MOON', personality: '飾らない自然体の魅力を持つ黒ひょうです。気取らない人柄で誰からも親しまれ、センスの良さが自然ににじみ出ています。', compatibility: '守りの猿' },
  { number: 57, animal: 'ライオン', character: '感情的なライオン', color: 'ゴールド', group: 'SUN', personality: '感情表現が豊かで、喜怒哀楽をストレートに表すタイプです。情熱的で愛情深く、大切な人に対しては惜しみない愛情を注ぎます。', compatibility: 'どっしりとした猿' },
  { number: 58, animal: 'ライオン', character: '傷つきやすいライオン', color: 'シルバー', group: 'SUN', personality: '王者の風格の中に繊細な心を持つタイプです。プライドが高い一方で傷つきやすく、周囲の評価を気にする一面があります。その繊細さが深い思慮につながっています。', compatibility: 'コアラのなかのコアラ' },
  { number: 59, animal: '黒ひょう', character: '束縛を嫌う黒ひょう', color: 'ブルー', group: 'MOON', personality: '自由を愛し、束縛されることを何よりも嫌うタイプです。独立心が強く、自分のペースで生きることを大切にします。ミステリアスな魅力で周囲を惹きつけます。', compatibility: 'パワフルな虎' },
  { number: 60, animal: '虎', character: '慈悲深い虎', color: 'パープル', group: 'EARTH', personality: '強さの中に深い慈悲の心を持つタイプです。弱い立場の人を守り、困っている人に手を差し伸べる正義感があります。厳しさと優しさを使い分けられる人格者です。', compatibility: '落ち込みの激しい黒ひょう' },
];

export const animalAdvice: string[] = [
  'あなたのキャラクターの強みを活かして、今日の課題にも自信を持って取り組みましょう。自分らしさが最大の武器です。',
  '直感を信じて行動してみましょう。動物占いが示すあなたの本質は、正しい方向を指し示しています。',
  '相性の良いキャラクターの人と過ごすと、エネルギーが高まります。大切な人との時間を作りましょう。',
  'あなたのカラーのアイテムを身につけると、運気がアップします。ファッションに取り入れてみてください。',
  '今日はチームワークが大切な日です。一人で抱え込まず、周囲の仲間に助けを求めましょう。協力が大きな成果を生みます。',
  '新しいことに挑戦するのに最適な日です。あなたの内なるエネルギーが高まっています。一歩踏み出してみましょう。',
  '人間関係を見直すと良い発見があるかもしれません。動物占いの相性を参考に、新しいつながりを作ってみましょう。',
  '自然の中で過ごすと、あなたの動物キャラクターのパワーが充電されます。散歩や公園でのリフレッシュがおすすめです。',
  '今日のラッキーポイントは「食」です。旬の食材を楽しんで、体の中からエネルギーを満たしましょう。',
  '新しい学びやスキルアップに力を注ぐと良いでしょう。成長期に入っているあなたの可能性は無限大です。',
  '直感が冴えている日です。ふと思い浮かんだアイデアをメモしておくと、後で役に立つでしょう。',
  '心の休息が必要な日です。無理をせず、自分のペースで過ごすことで明日への活力が生まれます。',
  'コミュニケーション運が上昇中です。普段話さない人にも声をかけてみると、新しいつながりが生まれるでしょう。',
  '過去の経験が今のあなたを支えています。自信を持って決断してください。あなたの選択は正しい方向に向かっています。',
  '感謝の気持ちを言葉にして伝えると、人間関係がさらに深まります。小さな「ありがとう」が大きな力になります。',
];

// グループの相性関係: MOON > EARTH > SUN > MOON
export const groupNames: Record<string, string> = {
  SUN: '太陽グループ',
  EARTH: '地球グループ',
  MOON: '月グループ',
};

export const groupDescriptions: Record<string, string> = {
  SUN: '権威を好み、尊敬されたい。自分軸で行動する状況対応型',
  EARTH: '合理的で無駄を嫌う。自分のペースを大切にする',
  MOON: '人との関わりを大切にする。他者軸で考える',
};
