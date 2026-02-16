"use client";

import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { BirthstoneResult } from "@/lib/types";
import { fetchBirthstoneFortune } from "@/lib/api-client";
import { useFortune } from "@/lib/useFortune";
import LoadingState from "@/components/fortune/LoadingState";
import ErrorState from "@/components/fortune/ErrorState";
import ResultCard from "@/components/fortune/ResultCard";
import ScoreDisplay from "@/components/fortune/ScoreDisplay";
import OtherFortunes from "@/components/fortune/OtherFortunes";
import ShareButtons from "@/components/fortune/ShareButtons";

export default function BirthstonePage() {
  const { result, loading, error, retry } = useFortune<BirthstoneResult>({
    fetcher: fetchBirthstoneFortune,
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
          誕生石占い
        </h1>
        <p className="text-text-secondary">
          {result.stone}（{result.stoneEn}）
        </p>
      </div>

      <div className="space-y-4">
        <ResultCard title="今日の運勢">
          <ScoreDisplay score={result.score} />
        </ResultCard>

        <ResultCard title="石の効果">
          <p className="text-text-secondary leading-relaxed">
            {result.effect}
          </p>
        </ResultCard>

        <ResultCard title="性格">
          <p className="text-text-secondary leading-relaxed">
            {result.personality}
          </p>
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

      <ShareButtons
        title={`誕生石占い - ${result.stone}`}
        text={`石の効果: ${result.effect} ${result.advice}`}
      />

      <OtherFortunes current="birthstone" />
    </div>
  );
}
