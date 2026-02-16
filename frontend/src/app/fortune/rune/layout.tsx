import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ルーン占い",
  description: "古代ルーン文字で過去・現在・未来を占います。",
};

export default function RuneLayout({ children }: { children: React.ReactNode }) {
  return children;
}
