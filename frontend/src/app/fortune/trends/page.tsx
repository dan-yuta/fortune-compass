"use client";

import Link from "next/link";
import { ArrowLeft, Sparkles, Star, AlertTriangle } from "lucide-react";
import { TrendsResult } from "@/lib/types";
import { fetchTrendsFortune } from "@/lib/api-client";
import { useFortune } from "@/lib/useFortune";
import LoadingState from "@/components/fortune/LoadingState";
import ErrorState from "@/components/fortune/ErrorState";
import ResultCard from "@/components/fortune/ResultCard";
import OtherFortunes from "@/components/fortune/OtherFortunes";
import ShareButtons from "@/components/fortune/ShareButtons";
import TrendChart from "@/components/fortune/TrendChart";

export default function TrendsPage() {
  const { result, loading, error, retry } = useFortune<TrendsResult>({
    fetcher: fetchTrendsFortune,
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
          運勢トレンド
        </h1>
        <p className="text-text-secondary">7日間の運勢推移グラフ</p>
      </div>

      <div className="space-y-4">
        <ResultCard title="7日間グラフ">
          <TrendChart days={result.days} />
        </ResultCard>

        <ResultCard title="各日のスコア">
          <div className="grid grid-cols-7 gap-1 text-center">
            {result.days.map((day, i) => (
              <div
                key={i}
                className={`rounded-lg p-2 ${
                  day.dayLabel === "今日"
                    ? "bg-mystic-purple/20 border border-mystic-purple/40"
                    : "bg-twilight"
                }`}
              >
                <p className="text-xs text-text-muted mb-1">{day.dayLabel}</p>
                <p className="text-lg font-bold text-text-primary">
                  {day.overall}
                </p>
                <p className="text-xs text-text-muted">/5</p>
              </div>
            ))}
          </div>
        </ResultCard>

        <div className="grid grid-cols-2 gap-4">
          <ResultCard title="ベストデー">
            <div className="flex items-center gap-2">
              <Star
                className="w-5 h-5 text-celestial-gold"
                aria-hidden="true"
              />
              <span className="text-text-primary font-semibold">
                {result.bestDay}
              </span>
            </div>
          </ResultCard>
          <ResultCard title="注意日">
            <div className="flex items-center gap-2">
              <AlertTriangle
                className="w-5 h-5 text-crimson"
                aria-hidden="true"
              />
              <span className="text-text-primary font-semibold">
                {result.worstDay}
              </span>
            </div>
          </ResultCard>
        </div>

        <ResultCard title="アドバイス">
          <div className="flex items-start gap-3">
            <Sparkles
              className="w-5 h-5 text-celestial-gold flex-shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <p className="text-text-secondary leading-relaxed">
              {result.advice}
            </p>
          </div>
        </ResultCard>
      </div>

      <ShareButtons
        title="運勢トレンド"
        text={`ベストデー: ${result.bestDay} ${result.advice}`}
      />

      <OtherFortunes current="trends" />
    </div>
  );
}
