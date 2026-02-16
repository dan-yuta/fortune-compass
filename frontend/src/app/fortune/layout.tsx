import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "占い選択",
  description: "星座占い・数秘術・血液型占い・タロット占いから占いたい方法を選んでください。",
};

export default function FortuneLayout({ children }: { children: React.ReactNode }) {
  return children;
}
