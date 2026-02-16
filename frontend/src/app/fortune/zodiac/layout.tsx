import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "星座占い - Fortune Compass",
  description: "あなたの星座から今日の運勢を占います。ラッキーカラーやアドバイスもお届け。",
};

export default function ZodiacLayout({ children }: { children: React.ReactNode }) {
  return children;
}
