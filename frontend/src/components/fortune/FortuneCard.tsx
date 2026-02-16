"use client";

import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface FortuneCardProps {
  title: string;
  icon: LucideIcon;
  description: string;
  href: string;
  disabled?: boolean;
  disabledMessage?: string;
}

export default function FortuneCard({
  title,
  icon: Icon,
  description,
  href,
  disabled = false,
  disabledMessage,
}: FortuneCardProps) {
  if (disabled) {
    return (
      <div className="bg-deep-purple rounded-xl p-6 border border-mystic-purple/20 opacity-50 pointer-events-none">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-twilight flex items-center justify-center">
            <Icon className="w-6 h-6 text-text-muted" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-text-primary mb-1">
              {title}
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              {description}
            </p>
            {disabledMessage && (
              <p className="text-xs text-text-muted mt-2">{disabledMessage}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Link
      href={href}
      className="block bg-deep-purple rounded-xl p-6 border border-mystic-purple/20 hover:border-mystic-purple/60 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-twilight flex items-center justify-center">
          <Icon className="w-6 h-6 text-mystic-purple" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-text-primary mb-1">
            {title}
          </h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </Link>
  );
}
