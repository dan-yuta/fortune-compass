import type { Metadata } from "next";
import { Inter, Noto_Sans_JP } from "next/font/google";
import Header from "@/components/Header";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-noto-sans-jp",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Fortune Compass - あなたの運命を照らす",
  description:
    "星座占い、数秘術、血液型占い、タロットであなたの運勢を占います。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${inter.variable} ${notoSansJP.variable} antialiased bg-midnight text-text-primary`}
      >
        <Header />
        <main className="max-w-4xl mx-auto px-4 md:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
