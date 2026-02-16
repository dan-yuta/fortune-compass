import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "四柱推命",
  description: "四柱推命で天干地支から命式を算出し運勢を読み解きます。",
};

export default function ShichuuLayout({ children }: { children: React.ReactNode }) {
  return children;
}
