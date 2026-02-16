"use client";

import Link from "next/link";
import { ArrowLeft, Sparkles, Heart } from "lucide-react";
import { BloodTypeResult } from "@/lib/types";
import { fetchBloodTypeFortune } from "@/lib/api-client";
import { useFortune } from "@/lib/useFortune";
import LoadingState from "@/components/fortune/LoadingState";
import ErrorState from "@/components/fortune/ErrorState";
import ResultCard from "@/components/fortune/ResultCard";
import ScoreDisplay from "@/components/fortune/ScoreDisplay";
import OtherFortunes from "@/components/fortune/OtherFortunes";
import ShareButtons from "@/components/fortune/ShareButtons";

export default function BloodTypePage() {
  const { result, loading, error, retry } = useFortune<BloodTypeResult>({
    fetcher: fetchBloodTypeFortune,
    requireBloodType: true,
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
          血液型占い
        </h1>
        <p className="text-text-secondary">
          {result.bloodType}型のあなたの運勢
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

        <ResultCard title="相性ランキング">
          <ol className="space-y-3">
            {result.compatibilityRanking.map((type, index) => (
              <li key={type} className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-twilight border border-mystic-purple/20">
                  <span
                    className={`text-sm font-bold ${
                      index === 0
                        ? "text-celestial-gold"
                        : index === 1
                          ? "text-aurora-green"
                          : "text-text-secondary"
                    }`}
                  >
                    {index + 1}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart
                    className={`w-4 h-4 ${
                      index === 0
                        ? "text-crimson fill-crimson"
                        : "text-text-muted"
                    }`}
                    aria-hidden="true"
                  />
                  <span className="text-text-primary font-medium">
                    {type}型
                  </span>
                </div>
              </li>
            ))}
          </ol>
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
        title={`血液型占い - ${result.bloodType}型`}
        text={`今日の運勢: ${"★".repeat(result.score)}${"☆".repeat(5 - result.score)} ${result.advice}`}
      />

      <OtherFortunes current="blood-type" />
    </div>
  );
}
