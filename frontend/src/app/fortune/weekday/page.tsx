"use client";

import Link from "next/link";
import { ArrowLeft, Sparkles, Palette } from "lucide-react";
import { WeekdayResult } from "@/lib/types";
import { fetchWeekdayFortune } from "@/lib/api-client";
import { useFortune } from "@/lib/useFortune";
import LoadingState from "@/components/fortune/LoadingState";
import ErrorState from "@/components/fortune/ErrorState";
import ResultCard from "@/components/fortune/ResultCard";
import ScoreDisplay from "@/components/fortune/ScoreDisplay";
import OtherFortunes from "@/components/fortune/OtherFortunes";
import ShareButtons from "@/components/fortune/ShareButtons";

export default function WeekdayPage() {
  const { result, loading, error, retry } = useFortune<WeekdayResult>({
    fetcher: fetchWeekdayFortune,
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
          曜日占い
        </h1>
        <p className="text-text-secondary">
          あなたは{result.weekday}生まれ（{result.weekdayEn}）
        </p>
      </div>

      <div className="space-y-4">
        <ResultCard title="今日の運勢">
          <ScoreDisplay score={result.score} />
        </ResultCard>

        <ResultCard title="性格">
          <p className="text-text-secondary leading-relaxed">
            {result.personality}
          </p>
        </ResultCard>

        <ResultCard title="ラッキーカラー">
          <div className="flex items-center gap-3">
            <Palette className="w-5 h-5 text-mystic-purple flex-shrink-0" aria-hidden="true" />
            <p className="text-text-primary font-medium">
              {result.luckyColor}
            </p>
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

      <ShareButtons
        title={`曜日占い - ${result.weekday}`}
        text={`性格: ${result.personality} ${result.advice}`}
      />

      <OtherFortunes current="weekday" />
    </div>
  );
}
