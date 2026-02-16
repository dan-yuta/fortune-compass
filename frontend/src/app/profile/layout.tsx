import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "プロフィール設定 - Fortune Compass",
  description: "占いに必要なプロフィール情報を入力してください。",
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
