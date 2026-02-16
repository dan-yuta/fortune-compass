"use client";

import Link from "next/link";
import { ArrowLeft, Sparkles, RotateCcw } from "lucide-react";
import { TarotResult } from "@/lib/types";
import { fetchTarotFortune } from "@/lib/api-client";
import { useFortune } from "@/lib/useFortune";
import LoadingState from "@/components/fortune/LoadingState";
import ErrorState from "@/components/fortune/ErrorState";
import ResultCard from "@/components/fortune/ResultCard";

export default function TarotPage() {
  const { result, loading, error, retry } = useFortune<TarotResult>({
    fetcher: fetchTarotFortune,
  });

  if (loading) {
    return <LoadingState />;
  }

  if (error || !result) {
    return (
      <ErrorState
        onRetry={retry}
        message={error || "占い結果を取得できませんでした"}
      />
    );
  }

  return (
    <div className="animate-fade-in">
      <Link
        href="/fortune"
        className="inline-flex items-center gap-1.5 text-text-secondary hover:text-text-primary transition-colors duration-200 mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">占い一覧に戻る</span>
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">
          タロット占い
        </h1>
        <p className="text-text-secondary">
          {result.spread}スプレッド
        </p>
      </div>

      {/* Tarot Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {result.cards.map((card, index) => (
          <article
            key={index}
            className="bg-deep-purple rounded-xl p-5 border border-mystic-purple/20 text-center"
          >
            <p className="text-xs text-text-muted uppercase tracking-wider mb-3">
              {card.positionLabel}
            </p>

            <div className="flex items-center justify-center mb-3">
              <span className="text-3xl font-bold text-celestial-gold">
                {card.number}
              </span>
            </div>

            <h3 className="text-lg font-semibold text-text-primary mb-1">
              {card.name}
            </h3>
            <p className="text-sm text-text-muted mb-2">{card.nameEn}</p>

            {card.isReversed && (
              <span className="inline-block bg-crimson/20 text-crimson text-xs font-medium px-2.5 py-1 rounded-full">
                逆位置
              </span>
            )}
          </article>
        ))}
      </div>

      {/* Card details */}
      <div className="space-y-4">
        {result.cards.map((card, index) => (
          <ResultCard key={index} title={`${card.positionLabel} - ${card.name}`}>
            <p className="text-text-secondary leading-relaxed">
              {card.isReversed ? card.reversedMeaning : card.meaning}
            </p>
          </ResultCard>
        ))}

        <ResultCard title="総合メッセージ">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-celestial-gold flex-shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-text-secondary leading-relaxed">
              {result.overallMessage}
            </p>
          </div>
        </ResultCard>
      </div>

      {/* Navigation */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={retry}
          className="inline-flex items-center gap-2 bg-twilight text-text-primary border border-mystic-purple/20 rounded-lg px-6 py-3 font-medium hover:border-mystic-purple/60 transition-all duration-200 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-mystic-purple/60"
        >
          <RotateCcw className="w-4 h-4" aria-hidden="true" />
          もう一度引く
        </button>
        <Link
          href="/fortune"
          className="inline-block bg-gradient-to-r from-mystic-purple to-purple-700 text-white rounded-lg px-6 py-3 font-medium hover:opacity-90 transition-all duration-200 active:scale-[0.98]"
        >
          他の占いを試す
        </Link>
      </div>
    </div>
  );
}
