import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "誕生花占い",
  description: "あなたの誕生花と花言葉から運勢を占います。",
};

export default function BirthFlowerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
