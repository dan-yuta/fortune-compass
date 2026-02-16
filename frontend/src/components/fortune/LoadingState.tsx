"use client";

import Link from "next/link";
import { Star, ArrowLeft } from "lucide-react";

export default function LoadingState() {
  return (
    <div
      className="flex flex-col items-center justify-center py-24 animate-fade-in"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3 mb-6">
        <Star className="w-6 h-6 text-celestial-gold animate-pulse" aria-hidden="true" />
        <Star
          className="w-8 h-8 text-mystic-purple animate-pulse"
          style={{ animationDelay: "150ms" }}
          aria-hidden="true"
        />
        <Star
          className="w-6 h-6 text-celestial-gold animate-pulse"
          style={{ animationDelay: "300ms" }}
          aria-hidden="true"
        />
      </div>
      <p className="text-text-secondary text-lg mb-8">占っています...</p>
      <Link
        href="/fortune"
        className="inline-flex items-center gap-1.5 text-text-muted hover:text-text-primary transition-colors duration-200 text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        占い一覧に戻る
      </Link>
    </div>
  );
}
