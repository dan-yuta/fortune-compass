"use client";

import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { ShichuuResult } from "@/lib/types";
import { fetchShichuuFortune } from "@/lib/api-client";
import { useFortune } from "@/lib/useFortune";
import LoadingState from "@/components/fortune/LoadingState";
import ErrorState from "@/components/fortune/ErrorState";
import ResultCard from "@/components/fortune/ResultCard";
import ScoreDisplay from "@/components/fortune/ScoreDisplay";
import OtherFortunes from "@/components/fortune/OtherFortunes";
import ShareButtons from "@/components/fortune/ShareButtons";

export default function ShichuuPage() {
  const { result, loading, error, retry } = useFortune<ShichuuResult>({
    fetcher: fetchShichuuFortune,
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
          四柱推命
        </h1>
        <p className="text-text-secondary">
          日主: {result.dayMaster}
        </p>
      </div>

      <div className="space-y-4">
        <ResultCard title="命式">
          <div className={`grid ${result.hourPillar ? 'grid-cols-4' : 'grid-cols-3'} gap-4 text-center`}>
            <div className="bg-twilight rounded-lg p-4 border border-mystic-purple/10">
              <p className="text-xs text-text-muted mb-1">年柱</p>
              <p className="text-lg font-semibold text-text-primary">
                {result.yearPillar}
              </p>
            </div>
            <div className="bg-twilight rounded-lg p-4 border border-mystic-purple/10">
              <p className="text-xs text-text-muted mb-1">月柱</p>
              <p className="text-lg font-semibold text-text-primary">
                {result.monthPillar}
              </p>
            </div>
            <div className="bg-twilight rounded-lg p-4 border border-mystic-purple/10">
              <p className="text-xs text-text-muted mb-1">日柱</p>
              <p className="text-lg font-semibold text-text-primary">
                {result.dayPillar}
              </p>
            </div>
            {result.hourPillar && (
              <div className="bg-twilight rounded-lg p-4 border border-mystic-purple/10">
                <p className="text-xs text-text-muted mb-1">時柱</p>
                <p className="text-lg font-semibold text-text-primary">
                  {result.hourPillar}
                </p>
              </div>
            )}
          </div>
          {!result.hourPillar && (
            <p className="text-text-muted text-xs mt-3 text-center">
              プロフィールで生まれ時刻を設定すると時柱も表示されます
            </p>
          )}
        </ResultCard>

        <ResultCard title="今日の運勢">
          <ScoreDisplay score={result.score} />
        </ResultCard>

        <ResultCard title="五行">
          <p className="text-text-secondary leading-relaxed">
            {result.element}
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
        title={`四柱推命 - ${result.dayMaster}`}
        text={`性格: ${result.personality} ${result.advice}`}
      />

      <OtherFortunes current="shichuu" />
    </div>
  );
}
