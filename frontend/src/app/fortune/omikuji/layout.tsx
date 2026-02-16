import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "おみくじ",
  description: "今日の運勢を大吉から凶の7段階で占います。",
};

export default function OmikujiLayout({ children }: { children: React.ReactNode }) {
  return children;
}
