"use client";

import { Star } from "lucide-react";

export default function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <Star className="w-6 h-6 text-celestial-gold animate-pulse" />
        <Star
          className="w-8 h-8 text-mystic-purple animate-pulse"
          style={{ animationDelay: "150ms" }}
        />
        <Star
          className="w-6 h-6 text-celestial-gold animate-pulse"
          style={{ animationDelay: "300ms" }}
        />
      </div>
      <p className="text-text-secondary text-lg">占っています...</p>
    </div>
  );
}
