"use client";

import { Star } from "lucide-react";

interface ScoreDisplayProps {
  score: number;
}

function getScoreColor(score: number): string {
  switch (score) {
    case 5:
      return "text-celestial-gold";
    case 4:
      return "text-aurora-green";
    case 3:
      return "text-mystic-purple";
    case 2:
      return "text-ember-orange";
    case 1:
      return "text-crimson";
    default:
      return "text-text-muted";
  }
}

export default function ScoreDisplay({ score }: ScoreDisplayProps) {
  const colorClass = getScoreColor(score);
  const clampedScore = Math.max(0, Math.min(5, Math.round(score)));

  return (
    <div
      className="flex items-center gap-1"
      aria-label={`スコア: ${clampedScore}点（5点満点）`}
      role="img"
    >
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`w-6 h-6 transition-all duration-200 ${
            i < clampedScore
              ? `${colorClass} fill-current`
              : "text-text-muted"
          }`}
          fill={i < clampedScore ? "currentColor" : "none"}
        />
      ))}
    </div>
  );
}
