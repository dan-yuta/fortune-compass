import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI総合鑑定",
  description: "複数の占いを統合しAIが総合鑑定文を生成します。",
};

export default function AiReadingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
