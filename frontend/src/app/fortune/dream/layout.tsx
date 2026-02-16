import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "夢占い",
  description: "夢のキーワードから深層心理と運勢を読み解きます。",
};

export default function DreamLayout({ children }: { children: React.ReactNode }) {
  return children;
}
