import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "干支占い",
  description: "十二支から今日の運勢と性格を占います。",
};

export default function EtoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
