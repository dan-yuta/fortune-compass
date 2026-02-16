import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_JP } from "next/font/google";
import Header from "@/components/Header";
import { I18nProvider } from "@/lib/i18n/context";
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
  title: {
    default: "Fortune Compass - あなたの運命を照らす",
    template: "%s | Fortune Compass",
  },
  description:
    "星座占い、数秘術、血液型占い、タロットであなたの運勢を占います。",
  metadataBase: new URL("https://d71oywvumn06c.cloudfront.net"),
  openGraph: {
    title: "Fortune Compass - あなたの運命を照らす",
    description: "4つの占術であなたの運勢を占う総合占いWebアプリ",
    url: "https://d71oywvumn06c.cloudfront.net",
    siteName: "Fortune Compass",
    locale: "ja_JP",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Fortune Compass - 総合占いアプリ",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fortune Compass - あなたの運命を照らす",
    description: "4つの占術であなたの運勢を占う総合占いWebアプリ",
    images: ["/opengraph-image"],
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/icon-192.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f0a1e",
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
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-mystic-purple focus:text-white focus:px-4 focus:py-2 focus:rounded-lg"
        >
          メインコンテンツへスキップ
        </a>
        <I18nProvider>
          <Header />
          <main id="main-content" className="max-w-4xl mx-auto px-4 md:px-8 py-8">
            {children}
          </main>
        </I18nProvider>
      </body>
    </html>
  );
}
