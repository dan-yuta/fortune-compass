import { getDictionary, dictionaries } from "@/lib/i18n/dictionaries";

describe("i18n dictionaries", () => {
  it("returns Japanese dictionary", () => {
    const dict = getDictionary("ja");
    expect(dict.home.title).toBe("Fortune Compass");
    expect(dict.home.subtitle).toBe("あなたの運命を照らす");
  });

  it("returns English dictionary", () => {
    const dict = getDictionary("en");
    expect(dict.home.title).toBe("Fortune Compass");
    expect(dict.home.subtitle).toBe("Illuminate Your Destiny");
  });

  it("has same keys in both languages", () => {
    const jaKeys = JSON.stringify(Object.keys(dictionaries.ja).sort());
    const enKeys = JSON.stringify(Object.keys(dictionaries.en).sort());
    expect(jaKeys).toBe(enKeys);
  });

  it("has fortune section keys matching", () => {
    const jaKeys = Object.keys(dictionaries.ja.fortune).sort();
    const enKeys = Object.keys(dictionaries.en.fortune).sort();
    expect(jaKeys).toEqual(enKeys);
  });

  it("has common section keys matching", () => {
    const jaKeys = Object.keys(dictionaries.ja.common).sort();
    const enKeys = Object.keys(dictionaries.en.common).sort();
    expect(jaKeys).toEqual(enKeys);
  });
});
