import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "運勢トレンド",
  description: "7日間の運勢推移を折れ線グラフで可視化します。",
};

export default function TrendsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
