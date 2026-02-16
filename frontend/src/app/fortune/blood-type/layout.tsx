import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "血液型占い - Fortune Compass",
  description: "血液型から性格と相性を占います。今日の運勢スコアとアドバイスをお届け。",
};

export default function BloodTypeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
