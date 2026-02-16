import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "動物占い",
  description: "生年月日から60パターンの動物キャラクターを診断します。",
};

export default function AnimalLayout({ children }: { children: React.ReactNode }) {
  return children;
}
