import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "九星気学",
  description: "九星気学であなたの運勢と吉方位を占います。",
};

export default function KyuseiLayout({ children }: { children: React.ReactNode }) {
  return children;
}
