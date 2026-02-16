"use client";

import Link from "next/link";
import { Star, User, Clock } from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";
import { useI18n } from "@/lib/i18n/context";

export default function Header() {
  const { t } = useI18n();

  return (
    <header className="sticky top-0 z-50 h-16 bg-midnight/80 backdrop-blur-md border-b border-mystic-purple/10">
      <nav className="max-w-4xl mx-auto px-4 md:px-8 h-full flex items-center justify-between" aria-label="メインナビゲーション">
        <Link
          href="/"
          className="flex items-center gap-2 text-text-primary hover:text-mystic-purple transition-colors duration-200"
        >
          <Star className="w-5 h-5 text-celestial-gold" aria-hidden="true" />
          <span className="font-semibold text-lg">Fortune Compass</span>
        </Link>

        <div className="flex items-center gap-1">
          <LanguageSwitcher />
          <Link
            href="/history"
            className="flex items-center gap-1.5 text-text-secondary hover:text-text-primary transition-colors duration-200 rounded-lg px-3 py-2 hover:bg-deep-purple focus:outline-none focus:ring-2 focus:ring-mystic-purple/60"
            aria-label="占い履歴"
          >
            <Clock className="w-5 h-5" aria-hidden="true" />
          </Link>
          <Link
            href="/profile"
            className="flex items-center gap-1.5 text-text-secondary hover:text-text-primary transition-colors duration-200 rounded-lg px-3 py-2 hover:bg-deep-purple focus:outline-none focus:ring-2 focus:ring-mystic-purple/60"
            aria-label={t.common.profile}
          >
            <User className="w-5 h-5" aria-hidden="true" />
          </Link>
        </div>
      </nav>
    </header>
  );
}
