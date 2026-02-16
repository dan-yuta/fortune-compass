import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "曜日占い",
  description: "生まれた曜日から性格と運勢を占います。",
};

export default function WeekdayLayout({ children }: { children: React.ReactNode }) {
  return children;
}
