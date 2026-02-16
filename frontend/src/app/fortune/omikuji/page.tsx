"use client";

import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { OmikujiResult } from "@/lib/types";
import { fetchOmikujiFortune } from "@/lib/api-client";
import { useFortune } from "@/lib/useFortune";
import LoadingState from "@/components/fortune/LoadingState";
import ErrorState from "@/components/fortune/ErrorState";
import ResultCard from "@/components/fortune/ResultCard";
import OtherFortunes from "@/components/fortune/OtherFortunes";
import ShareButtons from "@/components/fortune/ShareButtons";

function getRankStyle(rankLevel: number): { textColor: string; bgColor: string; borderColor: string } {
  switch (rankLevel) {
    case 1: // 大吉
      return {
        textColor: "text-celestial-gold",
        bgColor: "bg-celestial-gold/10",
        borderColor: "border-celestial-gold/30",
      };
    case 2: // 吉
      return {
        textColor: "text-aurora-green",
        bgColor: "bg-aurora-green/10",
        borderColor: "border-aurora-green/30",
      };
    case 3: // 中吉
      return {
        textColor: "text-aurora-green",
        bgColor: "bg-aurora-green/10",
        borderColor: "border-aurora-green/20",
      };
    case 4: // 小吉
      return {
        textColor: "text-mystic-purple",
        bgColor: "bg-mystic-purple/10",
        borderColor: "border-mystic-purple/20",
      };
    case 5: // 末吉
      return {
        textColor: "text-text-secondary",
        bgColor: "bg-twilight",
        borderColor: "border-mystic-purple/10",
      };
    case 6: // 凶
      return {
        textColor: "text-ember-orange",
        bgColor: "bg-ember-orange/10",
        borderColor: "border-ember-orange/20",
      };
    case 7: // 大凶
      return {
        textColor: "text-crimson",
        bgColor: "bg-crimson/10",
        borderColor: "border-crimson/20",
      };
    default:
      return {
        textColor: "text-text-primary",
        bgColor: "bg-twilight",
        borderColor: "border-mystic-purple/10",
      };
  }
}

export default function OmikujiPage() {
  const { result, loading, error, retry } = useFortune<OmikujiResult>({
    fetcher: fetchOmikujiFortune,
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

  const rankStyle = getRankStyle(result.rankLevel);

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
          おみくじ
        </h1>
      </div>

      {/* Rank display */}
      <div className={`${rankStyle.bgColor} ${rankStyle.borderColor} border rounded-xl p-8 mb-6 text-center`}>
        <p className={`text-5xl md:text-6xl font-bold ${rankStyle.textColor}`}>
          {result.rank}
        </p>
      </div>

      <div className="space-y-4">
        <ResultCard title="願い事">
          <p className="text-text-secondary leading-relaxed">
            {result.wish}
          </p>
        </ResultCard>

        <ResultCard title="健康">
          <p className="text-text-secondary leading-relaxed">
            {result.health}
          </p>
        </ResultCard>

        <ResultCard title="恋愛">
          <p className="text-text-secondary leading-relaxed">
            {result.love}
          </p>
        </ResultCard>

        <ResultCard title="仕事">
          <p className="text-text-secondary leading-relaxed">
            {result.work}
          </p>
        </ResultCard>

        <ResultCard title="金運">
          <p className="text-text-secondary leading-relaxed">
            {result.money}
          </p>
        </ResultCard>

        <ResultCard title="旅行">
          <p className="text-text-secondary leading-relaxed">
            {result.travel}
          </p>
        </ResultCard>

        <ResultCard title="総合メッセージ">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-celestial-gold flex-shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-text-secondary leading-relaxed">
              {result.overallMessage}
            </p>
          </div>
        </ResultCard>
      </div>

      <ShareButtons
        title={`おみくじ - ${result.rank}`}
        text={result.overallMessage}
      />

      <OtherFortunes current="omikuji" />
    </div>
  );
}
