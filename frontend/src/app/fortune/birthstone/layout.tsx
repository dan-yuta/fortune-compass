import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "誕生石占い",
  description: "誕生月の石から運勢とパワーを占います。",
};

export default function BirthstoneLayout({ children }: { children: React.ReactNode }) {
  return children;
}
