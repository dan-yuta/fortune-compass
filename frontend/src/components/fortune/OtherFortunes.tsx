"use client";

import Link from "next/link";
import { Star, Hash, Droplet, Layers } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface FortuneLink {
  key: string;
  title: string;
  icon: LucideIcon;
  href: string;
}

const allFortunes: FortuneLink[] = [
  { key: "zodiac", title: "星座占い", icon: Star, href: "/fortune/zodiac" },
  { key: "numerology", title: "数秘術", icon: Hash, href: "/fortune/numerology" },
  { key: "blood-type", title: "血液型占い", icon: Droplet, href: "/fortune/blood-type" },
  { key: "tarot", title: "タロット占い", icon: Layers, href: "/fortune/tarot" },
];

interface OtherFortunesProps {
  current: string;
}

export default function OtherFortunes({ current }: OtherFortunesProps) {
  const others = allFortunes.filter((f) => f.key !== current);

  return (
    <div className="mt-10 pt-8 border-t border-mystic-purple/20">
      <h2 className="text-lg font-semibold text-text-primary mb-4 text-center">
        他の占いも試す
      </h2>
      <div className="grid grid-cols-3 gap-3">
        {others.map((fortune) => {
          const Icon = fortune.icon;
          return (
            <Link
              key={fortune.key}
              href={fortune.href}
              className="flex flex-col items-center gap-2 bg-deep-purple rounded-xl p-4 border border-mystic-purple/20 hover:border-mystic-purple/60 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-mystic-purple/60"
            >
              <Icon className="w-6 h-6 text-mystic-purple" aria-hidden="true" />
              <span className="text-sm text-text-primary font-medium text-center">
                {fortune.title}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
