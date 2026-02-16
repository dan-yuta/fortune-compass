import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "風水占い",
  description: "本命卦から吉凶方位とアドバイスを導きます。",
};

export default function FengshuiLayout({ children }: { children: React.ReactNode }) {
  return children;
}
