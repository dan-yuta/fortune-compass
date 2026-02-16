export interface NumerologyResult {
  fortuneType: 'numerology';
  destinyNumber: number;
  personalityTraits: string[];
  yearFortune: string;
  compatibility: number[];
  advice: string;
}

const MASTER_NUMBERS = [11, 22, 33];

const pythagoreanMap: Record<string, number> = {
  a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9,
  j: 1, k: 2, l: 3, m: 4, n: 5, o: 6, p: 7, q: 8, r: 9,
  s: 1, t: 2, u: 3, v: 4, w: 5, x: 6, y: 7, z: 8,
};

const destinyData: Record<number, { traits: string[]; yearFortune: string; compatibility: number[]; advice: string }> = {
  1: { traits: ['リーダーシップ', '独立心', '開拓精神'], yearFortune: '新しい始まりの年。積極的に行動することで道が開けます。', compatibility: [3, 5], advice: '自分の信念を貫きましょう。リーダーシップを発揮する時です。周囲を巻き込む力があなたにはあります。恐れずに先頭に立ってください。' },
  2: { traits: ['協調性', '感受性', '思いやり'], yearFortune: '人間関係が深まる年。パートナーシップが鍵となります。', compatibility: [4, 8], advice: '周囲との調和を大切にしましょう。あなたの優しさが力になります。相手の気持ちに寄り添うことで、深い信頼関係が築けるでしょう。' },
  3: { traits: ['創造性', '表現力', '社交性'], yearFortune: '表現力が輝く年。創造的な活動にツキがあります。', compatibility: [1, 5], advice: '創造力を存分に発揮しましょう。自己表現が幸運を呼びます。あなたの個性を活かした活動が、多くの人に影響を与えるでしょう。' },
  4: { traits: ['堅実', '忍耐力', '組織力'], yearFortune: '基盤を固める年。コツコツとした努力が実を結びます。', compatibility: [2, 8], advice: '着実に進むことが大切です。焦らず一歩一歩を大切に。地道な努力こそが、揺るぎない成功の土台となります。' },
  5: { traits: ['自由', '冒険心', '適応力'], yearFortune: '変化と冒険の年。新しい経験が人生を豊かにします。', compatibility: [1, 3], advice: '変化を恐れず新しいことにチャレンジしましょう。自由が原動力です。多様な経験があなたの人生を何倍も豊かにしてくれます。' },
  6: { traits: ['愛情', '責任感', '調和'], yearFortune: '愛と調和の年。家族や大切な人との絆が深まります。', compatibility: [3, 9], advice: '愛情を周囲に注ぎましょう。与えることで豊かさが返ってきます。大切な人との時間を最優先にすることで、心が満たされるでしょう。' },
  7: { traits: ['知的', '分析的', '内省的'], yearFortune: '成長と学びの年。内面的な探求が大きな発見をもたらします。', compatibility: [2, 4], advice: '自分の直感を信じて行動しましょう。知識の探求が運を開きます。深く考える力が、他の人には見えない真実を見つけ出します。' },
  8: { traits: ['野心', '実行力', '成功志向'], yearFortune: '目標達成の年。ビジネスや仕事で大きな成果が期待できます。', compatibility: [2, 4], advice: '大きな目標を掲げて行動しましょう。実行力が成功の鍵です。あなたの行動力と決断力は、周囲を動かす大きな原動力となります。' },
  9: { traits: ['博愛', '理想主義', '芸術性'], yearFortune: '完成と解放の年。一つのサイクルが終わり新たな始まりへ。', compatibility: [3, 6], advice: '視野を広げて世界を見つめましょう。あなたの理想が人を動かします。広い心で物事を捉えることが、新たな可能性を生み出します。' },
  11: { traits: ['直感力', 'スピリチュアル', 'インスピレーション'], yearFortune: 'スピリチュアルな覚醒の年。高い直感力で道を切り開きます。', compatibility: [2, 4], advice: '内なる声に従いましょう。あなたの直感は特別な力を持っています。その繊細な感受性を大切にすることで、他者を導く光となれるでしょう。' },
  22: { traits: ['ビジョナリー', '実現力', '大志'], yearFortune: '大きな夢を実現する年。壮大なビジョンが形になります。', compatibility: [4, 8], advice: '大きなビジョンを持ちましょう。あなたには夢を形にする力があります。壮大な理想と現実を結びつける稀有な才能を存分に活かしてください。' },
  33: { traits: ['マスターヒーラー', '無条件の愛', '奉仕'], yearFortune: '癒しと奉仕の年。あなたの存在が多くの人を救います。', compatibility: [6, 9], advice: '愛と癒しの力を信じましょう。あなたは特別な使命を持っています。無条件の愛を注ぐことで、周囲の人々の心に温かい光を灯すことができます。' },
};

function reduceToSingleDigit(num: number): number {
  while (num > 9 && !MASTER_NUMBERS.includes(num)) {
    num = String(num).split('').reduce((sum, d) => sum + parseInt(d, 10), 0);
  }
  return num;
}

export function calculateDestinyNumber(birthday: string): number {
  const digits = birthday.replace(/-/g, '');
  let sum = 0;
  for (const d of digits) {
    sum += parseInt(d, 10);
  }
  return reduceToSingleDigit(sum);
}

export function calculateNameNumber(name: string): number | null {
  if (!name || name.trim() === '') return null;
  const cleaned = name.toLowerCase().replace(/[^a-z]/g, '');
  if (cleaned.length === 0) return null;

  let sum = 0;
  for (const ch of cleaned) {
    sum += pythagoreanMap[ch] || 0;
  }
  return reduceToSingleDigit(sum);
}

export function getNumerologyFortune(birthday: string, name?: string): NumerologyResult {
  const date = new Date(birthday);
  if (isNaN(date.getTime())) {
    throw new Error('Invalid birthday format');
  }

  const destinyNumber = calculateDestinyNumber(birthday);
  const data = destinyData[destinyNumber];

  if (!data) {
    throw new Error(`No data for destiny number: ${destinyNumber}`);
  }

  return {
    fortuneType: 'numerology',
    destinyNumber,
    personalityTraits: data.traits,
    yearFortune: data.yearFortune,
    compatibility: data.compatibility,
    advice: data.advice,
  };
}
