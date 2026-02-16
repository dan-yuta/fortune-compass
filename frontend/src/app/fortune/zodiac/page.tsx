"use client";

import Link from "next/link";
import { ArrowLeft, Sparkles, Palette, Gift } from "lucide-react";
import { ZodiacResult } from "@/lib/types";
import { fetchZodiacFortune } from "@/lib/api-client";
import { useFortune } from "@/lib/useFortune";
import LoadingState from "@/components/fortune/LoadingState";
import ErrorState from "@/components/fortune/ErrorState";
import ResultCard from "@/components/fortune/ResultCard";
import ScoreDisplay from "@/components/fortune/ScoreDisplay";

export default function ZodiacPage() {
  const { result, loading, error, retry } = useFortune<ZodiacResult>({
    fetcher: fetchZodiacFortune,
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
          星座占い
        </h1>
        <p className="text-text-secondary">
          {result.sign}（{result.signEn}）・{result.element}
        </p>
      </div>

      <div className="space-y-4">
        <ResultCard title="今日の運勢">
          <ScoreDisplay score={result.score} />
        </ResultCard>

        <ResultCard title="ラッキーアイテム">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Palette className="w-5 h-5 text-mystic-purple flex-shrink-0" aria-hidden="true" />
              <div>
                <p className="text-xs text-text-muted">ラッキーカラー</p>
                <p className="text-text-primary font-medium">
                  {result.luckyColor}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Gift className="w-5 h-5 text-celestial-gold flex-shrink-0" aria-hidden="true" />
              <div>
                <p className="text-xs text-text-muted">ラッキーアイテム</p>
                <p className="text-text-primary font-medium">
                  {result.luckyItem}
                </p>
              </div>
            </div>
          </div>
        </ResultCard>

        <ResultCard title="アドバイス">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-celestial-gold flex-shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-text-secondary leading-relaxed">
              {result.advice}
            </p>
          </div>
        </ResultCard>
      </div>

      <div className="mt-8 text-center">
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
