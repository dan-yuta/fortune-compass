"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Trash2, Star, Hash, Droplet, Layers, Clock } from "lucide-react";
import { HistoryEntry, getHistory, clearHistory } from "@/lib/history";

const fortuneIcons: Record<string, typeof Star> = {
  zodiac: Star,
  numerology: Hash,
  "blood-type": Droplet,
  tarot: Layers,
};

const fortuneColors: Record<string, string> = {
  zodiac: "text-celestial-gold",
  numerology: "text-mystic-purple",
  "blood-type": "text-crimson",
  tarot: "text-aurora-green",
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hours = d.getHours().toString().padStart(2, "0");
  const minutes = d.getMinutes().toString().padStart(2, "0");
  return `${month}/${day} ${hours}:${minutes}`;
}

function getAdvice(entry: HistoryEntry): string {
  const r = entry.result;
  switch (r.fortuneType) {
    case "zodiac":
      return r.advice;
    case "numerology":
      return r.advice;
    case "blood-type":
      return r.advice;
    case "tarot":
      return r.overallMessage;
    default:
      return "";
  }
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const handleClear = useCallback(() => {
    clearHistory();
    setHistory([]);
    setShowConfirm(false);
  }, []);

  return (
    <div className="animate-fade-in">
      <Link
        href="/fortune"
        className="inline-flex items-center gap-1.5 text-text-secondary hover:text-text-primary transition-colors duration-200 mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">占い一覧に戻る</span>
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-1">
            占い履歴
          </h1>
          <p className="text-text-secondary text-sm">
            {history.length > 0
              ? `${history.length}件の結果`
              : "まだ履歴がありません"}
          </p>
        </div>
        {history.length > 0 && (
          <div>
            {showConfirm ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleClear}
                  className="text-sm text-crimson border border-crimson/30 rounded-lg px-3 py-1.5 hover:bg-crimson/10 transition-colors"
                >
                  削除する
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="text-sm text-text-secondary border border-mystic-purple/20 rounded-lg px-3 py-1.5 hover:bg-twilight transition-colors"
                >
                  キャンセル
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirm(true)}
                className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-crimson transition-colors"
                aria-label="履歴を全て削除"
              >
                <Trash2 className="w-4 h-4" />
                <span>全削除</span>
              </button>
            )}
          </div>
        )}
      </div>

      {history.length === 0 ? (
        <div className="text-center py-16">
          <Clock className="w-12 h-12 text-text-muted mx-auto mb-4" aria-hidden="true" />
          <p className="text-text-secondary mb-4">
            占いを実行すると、ここに結果が記録されます
          </p>
          <Link
            href="/fortune"
            className="inline-block bg-gradient-to-r from-mystic-purple to-purple-700 text-white rounded-lg px-6 py-3 font-medium hover:opacity-90 transition-all duration-200"
          >
            占いをはじめる
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((entry) => {
            const Icon = fortuneIcons[entry.fortuneType] || Star;
            const color = fortuneColors[entry.fortuneType] || "text-mystic-purple";
            const advice = getAdvice(entry);

            return (
              <article
                key={entry.id}
                className="bg-deep-purple rounded-xl p-4 border border-mystic-purple/20"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-twilight flex items-center justify-center mt-0.5">
                    <Icon className={`w-5 h-5 ${color}`} aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-text-primary truncate">
                        {entry.label}
                      </h3>
                      <span className="text-xs text-text-muted flex-shrink-0">
                        {formatDate(entry.timestamp)}
                      </span>
                    </div>
                    {advice && (
                      <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                        {advice}
                      </p>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
