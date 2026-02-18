"use client";

import Link from "next/link";
import { ArrowLeft, Sparkles, Lightbulb, Star } from "lucide-react";
import { AiReadingResult } from "@/lib/types";
import { fetchAiReadingFortune } from "@/lib/api-client";
import { useFortune } from "@/lib/useFortune";
import LoadingState from "@/components/fortune/LoadingState";
import ErrorState from "@/components/fortune/ErrorState";
import ResultCard from "@/components/fortune/ResultCard";
import OtherFortunes from "@/components/fortune/OtherFortunes";
import ShareButtons from "@/components/fortune/ShareButtons";

function AiLoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="relative w-16 h-16 mb-6">
        <div className="absolute inset-0 rounded-full border-2 border-mystic-purple/20 border-t-mystic-purple animate-spin" />
        <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-celestial-gold animate-pulse" />
      </div>
      <p className="text-text-primary font-medium mb-2">
        AI総合鑑定を生成中...
      </p>
      <p className="text-text-muted text-sm text-center max-w-xs">
        複数の占い結果を統合して鑑定文を作成しています。少々お待ちください。
      </p>
    </div>
  );
}

export default function AiReadingPage() {
  const { result, loading, error, retry } = useFortune<AiReadingResult>({
    fetcher: fetchAiReadingFortune,
  });

  if (loading) {
    return (
      <div className="animate-fade-in">
        <Link
          href="/fortune"
          className="inline-flex items-center gap-1.5 text-text-secondary hover:text-text-primary transition-colors duration-200 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">占い一覧に戻る</span>
        </Link>
        <AiLoadingState />
      </div>
    );
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
          AI総合鑑定
        </h1>
        <p className="text-text-secondary">
          {result.includedFortunes.join("・")}を統合分析
        </p>
      </div>

      <div className="space-y-4">
        <ResultCard title="総合鑑定">
          <div className="text-text-secondary leading-relaxed whitespace-pre-wrap">
            {result.reading}
          </div>
        </ResultCard>

        <ResultCard title="注目ポイント">
          <div className="space-y-3">
            {result.highlights.map((highlight, i) => (
              <div key={i} className="flex items-start gap-3">
                <Star
                  className="w-4 h-4 text-celestial-gold flex-shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <p className="text-text-secondary text-sm leading-relaxed">
                  {highlight}
                </p>
              </div>
            ))}
          </div>
        </ResultCard>

        <ResultCard title="おすすめアクション">
          <div className="flex items-start gap-3">
            <Lightbulb
              className="w-5 h-5 text-celestial-gold flex-shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <p className="text-text-secondary leading-relaxed">
              {result.luckyAction}
            </p>
          </div>
        </ResultCard>

        <div className="bg-deep-navy/50 rounded-lg p-3 border border-mystic-purple/10">
          <p className="text-text-muted text-xs text-center">
            参照した占い: {result.includedFortunes.join("、")}
          </p>
        </div>
      </div>

      <ShareButtons
        title="AI総合鑑定"
        text={result.highlights[0] || result.luckyAction}
      />

      <OtherFortunes current="ai-reading" />
    </div>
  );
}
