import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "相性占い",
  description: "二人の星座・血液型・数秘から相性を多角的に診断します。",
};

export default function CompatibilityLayout({ children }: { children: React.ReactNode }) {
  return children;
}
