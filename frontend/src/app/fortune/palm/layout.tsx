import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "手相占い",
  description: "手のひらの写真からAIが手相を分析します。",
};

export default function PalmLayout({ children }: { children: React.ReactNode }) {
  return children;
}
