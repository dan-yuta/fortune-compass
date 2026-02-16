import { kanaToRomaji } from "@/lib/kana-to-romaji";

describe("kanaToRomaji", () => {
  it("converts basic katakana", () => {
    expect(kanaToRomaji("ヤマダ")).toBe("yamada");
  });

  it("converts katakana with spaces", () => {
    expect(kanaToRomaji("ヤマダ タロウ")).toBe("yamada tarou");
  });

  it("handles empty string", () => {
    expect(kanaToRomaji("")).toBe("");
  });

  it("converts various katakana characters", () => {
    expect(kanaToRomaji("アイウエオ")).toBe("aiueo");
  });

  it("converts long vowel mark", () => {
    const result = kanaToRomaji("タロー");
    expect(result).toContain("taro");
  });
});
