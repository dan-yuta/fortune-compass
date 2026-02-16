"use client";

import { useI18n } from "@/lib/i18n/context";
import { Globe } from "lucide-react";

export default function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  const toggleLocale = () => {
    setLocale(locale === "ja" ? "en" : "ja");
  };

  return (
    <button
      onClick={toggleLocale}
      className="flex items-center gap-1.5 text-text-secondary hover:text-text-primary transition-colors duration-200 rounded-lg px-2 py-2 hover:bg-deep-purple focus:outline-none focus:ring-2 focus:ring-mystic-purple/60 text-xs font-medium"
      aria-label={locale === "ja" ? "Switch to English" : "日本語に切り替え"}
    >
      <Globe className="w-4 h-4" aria-hidden="true" />
      <span>{locale === "ja" ? "EN" : "JP"}</span>
    </button>
  );
}
