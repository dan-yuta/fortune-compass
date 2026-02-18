import {
  Star,
  Hash,
  Droplet,
  Layers,
  Dog,
  Flower2,
  Gem,
  Calendar,
  Compass,
  Cat,
  ScrollText,
  Shrub,
  Eye,
  Hand,
  Dice5,
  Shield,
  Heart,
  TrendingUp,
  Brain,
} from "lucide-react";
import { LucideIcon } from "lucide-react";

export type FortuneCategory = "classic" | "birthday" | "traditional" | "special";

export interface FortuneMeta {
  id: string;
  label: string;
  icon: LucideIcon;
  category: FortuneCategory;
  path: string;
  description: string;
}

export const categoryLabels: Record<FortuneCategory, string> = {
  classic: "定番占い",
  birthday: "誕生日占い",
  traditional: "伝統占い",
  special: "特殊占い",
};

export const categoryOrder: FortuneCategory[] = [
  "classic",
  "birthday",
  "traditional",
  "special",
];

export const fortuneRegistry: FortuneMeta[] = [
  // 定番占い
  { id: "zodiac", label: "星座占い", icon: Star, category: "classic", path: "/fortune/zodiac", description: "あなたの星座から今日の運勢を占います" },
  { id: "numerology", label: "数秘術", icon: Hash, category: "classic", path: "/fortune/numerology", description: "名前と生年月日から運命数を算出します" },
  { id: "blood-type", label: "血液型占い", icon: Droplet, category: "classic", path: "/fortune/blood-type", description: "血液型から性格と相性を占います" },
  { id: "tarot", label: "タロット占い", icon: Layers, category: "classic", path: "/fortune/tarot", description: "タロットカードがあなたの運命を導きます" },

  // 誕生日占い
  { id: "eto", label: "干支占い", icon: Dog, category: "birthday", path: "/fortune/eto", description: "十二支から今日の運勢と性格を占います" },
  { id: "kyusei", label: "九星気学", icon: Compass, category: "birthday", path: "/fortune/kyusei", description: "九星から運勢と吉方位を導きます" },
  { id: "animal", label: "動物占い", icon: Cat, category: "birthday", path: "/fortune/animal", description: "生年月日から60パターンの動物キャラを診断" },
  { id: "birth-flower", label: "誕生花占い", icon: Flower2, category: "birthday", path: "/fortune/birth-flower", description: "あなたの誕生花と花言葉をお届けします" },
  { id: "birthstone", label: "誕生石占い", icon: Gem, category: "birthday", path: "/fortune/birthstone", description: "誕生月の石が持つパワーと効果を占います" },
  { id: "shichuu", label: "四柱推命", icon: ScrollText, category: "birthday", path: "/fortune/shichuu", description: "天干地支から命式を算出し運勢を読み解きます" },
  { id: "weekday", label: "曜日占い", icon: Calendar, category: "birthday", path: "/fortune/weekday", description: "生まれた曜日から性格と運勢を占います" },
  { id: "fengshui", label: "風水占い", icon: Shrub, category: "birthday", path: "/fortune/fengshui", description: "本命卦から吉凶方位とアドバイスを導きます" },

  // 伝統占い
  { id: "omikuji", label: "おみくじ", icon: Dice5, category: "traditional", path: "/fortune/omikuji", description: "今日の運勢を大吉〜凶の7段階で占います" },
  { id: "rune", label: "ルーン占い", icon: Shield, category: "traditional", path: "/fortune/rune", description: "古代ルーン文字が過去・現在・未来を導きます" },

  // 特殊占い
  { id: "dream", label: "夢占い", icon: Eye, category: "special", path: "/fortune/dream", description: "夢のキーワードから深層心理と運勢を読み解きます" },
  { id: "palm", label: "手相占い", icon: Hand, category: "special", path: "/fortune/palm", description: "手のひらの写真からAIが手相を分析します" },
  { id: "compatibility", label: "相性占い", icon: Heart, category: "special", path: "/fortune/compatibility", description: "二人の星座・血液型・数秘から相性を多角的に診断します" },
  { id: "trends", label: "運勢トレンド", icon: TrendingUp, category: "special", path: "/fortune/trends", description: "7日間の運勢推移を折れ線グラフで可視化します" },
  { id: "ai-reading", label: "AI総合鑑定", icon: Brain, category: "special", path: "/fortune/ai-reading", description: "複数の占いを統合しAIが総合鑑定文を生成します" },
];

export function getFortuneById(id: string): FortuneMeta | undefined {
  return fortuneRegistry.find((f) => f.id === id);
}

export function getFortunesByCategory(category: FortuneCategory): FortuneMeta[] {
  return fortuneRegistry.filter((f) => f.category === category);
}
