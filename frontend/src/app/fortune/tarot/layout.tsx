import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "タロット占い",
  description: "タロットカードがあなたの運命を導きます。3枚引きで過去・現在・未来を占います。",
};

export default function TarotLayout({ children }: { children: React.ReactNode }) {
  return children;
}
