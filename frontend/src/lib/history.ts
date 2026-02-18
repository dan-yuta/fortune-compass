import {
  ZodiacResult,
  NumerologyResult,
  BloodTypeResult,
  TarotResult,
  EtoResult,
  BirthFlowerResult,
  BirthstoneResult,
  WeekdayResult,
  KyuseiResult,
  AnimalResult,
  ShichuuResult,
  OmikujiResult,
  RuneResult,
  FengshuiResult,
  DreamResult,
  PalmResult,
  CompatibilityResult,
  TrendsResult,
  AiReadingResult,
} from "./types";

export type FortuneResult =
  | ZodiacResult
  | NumerologyResult
  | BloodTypeResult
  | TarotResult
  | EtoResult
  | BirthFlowerResult
  | BirthstoneResult
  | WeekdayResult
  | KyuseiResult
  | AnimalResult
  | ShichuuResult
  | OmikujiResult
  | RuneResult
  | FengshuiResult
  | DreamResult
  | PalmResult
  | CompatibilityResult
  | TrendsResult
  | AiReadingResult;

export interface HistoryEntry {
  id: string;
  timestamp: string;
  fortuneType: string;
  label: string;
  result: FortuneResult;
}

const HISTORY_KEY = "fortune-compass-history";
const MAX_ENTRIES = 50;

export function getHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    if (!data) return [];
    return JSON.parse(data) as HistoryEntry[];
  } catch {
    return [];
  }
}

export function saveToHistory(result: FortuneResult): void {
  try {
    const history = getHistory();
    const entry: HistoryEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: new Date().toISOString(),
      fortuneType: result.fortuneType,
      label: getLabel(result),
      result,
    };
    history.unshift(entry);
    if (history.length > MAX_ENTRIES) {
      history.length = MAX_ENTRIES;
    }
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error("Failed to save history:", error);
  }
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch {
    // ignore
  }
}

function getLabel(result: FortuneResult): string {
  switch (result.fortuneType) {
    case "zodiac":
      return `星座占い - ${result.sign}`;
    case "numerology":
      return `数秘術 - 運命数${result.destinyNumber}`;
    case "blood-type":
      return `血液型占い - ${result.bloodType}型`;
    case "tarot":
      return `タロット占い - ${result.cards.map((c) => c.name).join("・")}`;
    case "eto":
      return `干支占い - ${result.animal}`;
    case "birth-flower":
      return `誕生花占い - ${result.flower}`;
    case "birthstone":
      return `誕生石占い - ${result.stone}`;
    case "weekday":
      return `曜日占い - ${result.weekday}`;
    case "kyusei":
      return `九星気学 - ${result.star}`;
    case "animal":
      return `動物占い - ${result.color}の${result.animal}`;
    case "shichuu":
      return `四柱推命 - ${result.dayMaster}`;
    case "omikuji":
      return `おみくじ - ${result.rank}`;
    case "rune":
      return `ルーン占い - ${result.stones.map((s) => s.name).join("・")}`;
    case "fengshui":
      return `風水占い - ${result.gua}`;
    case "dream":
      return `夢占い - ${result.keyword}`;
    case "palm":
      return `手相占い`;
    case "compatibility":
      return `相性占い - ${result.person1Sign}×${result.person2Sign}`;
    case "trends":
      return `運勢トレンド - ベスト:${result.bestDay}`;
    case "ai-reading":
      return `AI総合鑑定`;
    default:
      return "占い結果";
  }
}
