const katakanaMap: Record<string, string> = {
  // Basic vowels
  ア: "a",
  イ: "i",
  ウ: "u",
  エ: "e",
  オ: "o",
  // K row
  カ: "ka",
  キ: "ki",
  ク: "ku",
  ケ: "ke",
  コ: "ko",
  // S row
  サ: "sa",
  シ: "shi",
  ス: "su",
  セ: "se",
  ソ: "so",
  // T row
  タ: "ta",
  チ: "chi",
  ツ: "tsu",
  テ: "te",
  ト: "to",
  // N row
  ナ: "na",
  ニ: "ni",
  ヌ: "nu",
  ネ: "ne",
  ノ: "no",
  // H row
  ハ: "ha",
  ヒ: "hi",
  フ: "fu",
  ヘ: "he",
  ホ: "ho",
  // M row
  マ: "ma",
  ミ: "mi",
  ム: "mu",
  メ: "me",
  モ: "mo",
  // Y row
  ヤ: "ya",
  ユ: "yu",
  ヨ: "yo",
  // R row
  ラ: "ra",
  リ: "ri",
  ル: "ru",
  レ: "re",
  ロ: "ro",
  // W row
  ワ: "wa",
  ヲ: "wo",
  // N
  ン: "n",

  // Dakuten - G row
  ガ: "ga",
  ギ: "gi",
  グ: "gu",
  ゲ: "ge",
  ゴ: "go",
  // Z row
  ザ: "za",
  ジ: "ji",
  ズ: "zu",
  ゼ: "ze",
  ゾ: "zo",
  // D row
  ダ: "da",
  ヂ: "di",
  ヅ: "du",
  デ: "de",
  ド: "do",
  // B row
  バ: "ba",
  ビ: "bi",
  ブ: "bu",
  ベ: "be",
  ボ: "bo",

  // Handakuten - P row
  パ: "pa",
  ピ: "pi",
  プ: "pu",
  ペ: "pe",
  ポ: "po",
};

const combinationMap: Record<string, string> = {
  // K combinations
  キャ: "kya",
  キュ: "kyu",
  キョ: "kyo",
  // S combinations
  シャ: "sha",
  シュ: "shu",
  ショ: "sho",
  // T combinations
  チャ: "cha",
  チュ: "chu",
  チョ: "cho",
  // N combinations
  ニャ: "nya",
  ニュ: "nyu",
  ニョ: "nyo",
  // H combinations
  ヒャ: "hya",
  ヒュ: "hyu",
  ヒョ: "hyo",
  // M combinations
  ミャ: "mya",
  ミュ: "myu",
  ミョ: "myo",
  // R combinations
  リャ: "rya",
  リュ: "ryu",
  リョ: "ryo",

  // Dakuten combinations
  ギャ: "gya",
  ギュ: "gyu",
  ギョ: "gyo",
  ジャ: "ja",
  ジュ: "ju",
  ジョ: "jo",
  ビャ: "bya",
  ビュ: "byu",
  ビョ: "byo",

  // Handakuten combinations
  ピャ: "pya",
  ピュ: "pyu",
  ピョ: "pyo",

  // Special combinations with ティ, ディ, etc.
  ティ: "ti",
  ディ: "di",
  ファ: "fa",
  フィ: "fi",
  フェ: "fe",
  フォ: "fo",
  ヴァ: "va",
  ヴィ: "vi",
  ヴ: "vu",
  ヴェ: "ve",
  ヴォ: "vo",
};

export function kanaToRomaji(kana: string): string {
  let result = "";
  let i = 0;

  while (i < kana.length) {
    // Check for small tsu (ッ) - doubles the next consonant
    if (kana[i] === "ッ") {
      // Look ahead to determine what consonant to double
      if (i + 1 < kana.length) {
        // Check for 2-char combination after ッ
        const nextTwo = kana.substring(i + 1, i + 3);
        const nextCombo = combinationMap[nextTwo];
        if (nextCombo && nextCombo.length > 0) {
          result += nextCombo[0];
          i++;
          continue;
        }
        // Check single char after ッ
        const nextOne = kana[i + 1];
        const nextRomaji = katakanaMap[nextOne];
        if (nextRomaji && nextRomaji.length > 0) {
          result += nextRomaji[0];
          i++;
          continue;
        }
      }
      // Fallback: just skip
      i++;
      continue;
    }

    // Check for long vowel mark (ー) - extends previous vowel
    if (kana[i] === "ー") {
      if (result.length > 0) {
        const lastChar = result[result.length - 1];
        result += lastChar;
      }
      i++;
      continue;
    }

    // Check for 2-char combinations first
    if (i + 1 < kana.length) {
      const twoChar = kana.substring(i, i + 2);
      if (combinationMap[twoChar]) {
        result += combinationMap[twoChar];
        i += 2;
        continue;
      }
    }

    // Check single character
    if (katakanaMap[kana[i]]) {
      result += katakanaMap[kana[i]];
      i++;
      continue;
    }

    // Pass through any unrecognized characters (spaces, romaji, etc.)
    result += kana[i];
    i++;
  }

  return result;
}
