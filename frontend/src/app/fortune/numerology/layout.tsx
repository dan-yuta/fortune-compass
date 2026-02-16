import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "数秘術 - Fortune Compass",
  description: "名前と生年月日から運命数を算出し、性格特性や年間運勢をお届けします。",
};

export default function NumerologyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
