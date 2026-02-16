"use client";

import Link from "next/link";
import { ArrowLeft, Sparkles, Users } from "lucide-react";
import { NumerologyResult } from "@/lib/types";
import { fetchNumerologyFortune } from "@/lib/api-client";
import { useFortune } from "@/lib/useFortune";
import LoadingState from "@/components/fortune/LoadingState";
import ErrorState from "@/components/fortune/ErrorState";
import ResultCard from "@/components/fortune/ResultCard";
import OtherFortunes from "@/components/fortune/OtherFortunes";
import ShareButtons from "@/components/fortune/ShareButtons";

export default function NumerologyPage() {
  const { result, loading, error, retry } = useFortune<NumerologyResult>({
    fetcher: fetchNumerologyFortune,
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
          数秘術
        </h1>
        <p className="text-text-secondary">
          あなたの運命数から導き出された結果です
        </p>
      </div>

      <div className="space-y-4">
        <ResultCard title="運命数">
          <div className="flex items-center justify-center py-4">
            <span className="text-6xl font-bold text-celestial-gold">
              {result.destinyNumber}
            </span>
          </div>
        </ResultCard>

        <ResultCard title="性格特性">
          <div className="flex flex-wrap gap-2">
            {result.personalityTraits.map((trait, index) => (
              <span
                key={index}
                className="inline-block bg-twilight text-mystic-purple px-3 py-1.5 rounded-full text-sm font-medium border border-mystic-purple/20"
              >
                {trait}
              </span>
            ))}
          </div>
        </ResultCard>

        <ResultCard title="年間運勢">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-celestial-gold flex-shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-text-secondary leading-relaxed">
              {result.yearFortune}
            </p>
          </div>
        </ResultCard>

        <ResultCard title="相性の良い運命数">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-mystic-purple flex-shrink-0" aria-hidden="true" />
            <div className="flex gap-2">
              {result.compatibility.map((num) => (
                <span
                  key={num}
                  className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-twilight border border-mystic-purple/20 text-celestial-gold font-bold"
                >
                  {num}
                </span>
              ))}
            </div>
          </div>
        </ResultCard>

        <ResultCard title="アドバイス">
          <p className="text-text-secondary leading-relaxed">{result.advice}</p>
        </ResultCard>
      </div>

      <ShareButtons
        title={`数秘術 - 運命数${result.destinyNumber}`}
        text={`性格: ${result.personalityTraits.join("・")} ${result.advice}`}
      />

      <OtherFortunes current="numerology" />
    </div>
  );
}
