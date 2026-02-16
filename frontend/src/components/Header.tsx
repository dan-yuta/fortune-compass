"use client";

import Link from "next/link";
import { Star, User } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 h-16 bg-midnight/80 backdrop-blur-md border-b border-mystic-purple/10">
      <div className="max-w-4xl mx-auto px-4 md:px-8 h-full flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-text-primary hover:text-mystic-purple transition-colors duration-200"
        >
          <Star className="w-5 h-5 text-celestial-gold" />
          <span className="font-semibold text-lg">Fortune Compass</span>
        </Link>

        <Link
          href="/profile"
          className="flex items-center gap-1.5 text-text-secondary hover:text-text-primary transition-colors duration-200 rounded-lg px-3 py-2 hover:bg-deep-purple"
          aria-label="プロフィール"
        >
          <User className="w-5 h-5" />
        </Link>
      </div>
    </header>
  );
}
