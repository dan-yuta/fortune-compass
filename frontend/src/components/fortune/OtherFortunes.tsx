"use client";

import Link from "next/link";
import {
  fortuneRegistry,
  getFortuneById,
} from "@/lib/fortune-registry";

interface OtherFortunesProps {
  current: string;
}

export default function OtherFortunes({ current }: OtherFortunesProps) {
  const currentFortune = getFortuneById(current);
  const currentCategory = currentFortune?.category;

  // Show same-category first, then others, up to 5 items
  const sameCat = fortuneRegistry.filter(
    (f) => f.id !== current && f.category === currentCategory
  );
  const otherCat = fortuneRegistry.filter(
    (f) => f.id !== current && f.category !== currentCategory
  );
  const others = [...sameCat, ...otherCat].slice(0, 5);

  return (
    <div className="mt-10 pt-8 border-t border-mystic-purple/20">
      <h2 className="text-lg font-semibold text-text-primary mb-4 text-center">
        他の占いも試す
      </h2>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
        {others.map((fortune) => {
          const Icon = fortune.icon;
          return (
            <Link
              key={fortune.id}
              href={fortune.path}
              className="flex flex-col items-center gap-2 bg-deep-purple rounded-xl p-4 border border-mystic-purple/20 hover:border-mystic-purple/60 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-mystic-purple/60"
            >
              <Icon className="w-6 h-6 text-mystic-purple" aria-hidden="true" />
              <span className="text-xs text-text-primary font-medium text-center leading-tight">
                {fortune.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
