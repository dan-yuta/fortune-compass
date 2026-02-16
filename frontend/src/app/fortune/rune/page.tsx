"use client";

import Link from "next/link";
import { ArrowLeft, Sparkles, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";
import { RuneResult } from "@/lib/types";
import { fetchRuneFortune } from "@/lib/api-client";
import { useFortune } from "@/lib/useFortune";
import LoadingState from "@/components/fortune/LoadingState";
import ErrorState from "@/components/fortune/ErrorState";
import ResultCard from "@/components/fortune/ResultCard";
import OtherFortunes from "@/components/fortune/OtherFortunes";
import ShareButtons from "@/components/fortune/ShareButtons";

export default function RunePage() {
  const { result, loading, error, retry } = useFortune<RuneResult>({
    fetcher: fetchRuneFortune,
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
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Link
        href="/fortune"
        className="inline-flex items-center gap-1.5 text-text-secondary hover:text-text-primary transition-colors duration-200 mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">占い一覧に戻る</span>
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">
          ルーン占い
        </h1>
      </div>

      {/* Rune stones with reveal animation */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {result.stones.map((stone, index) => (
          <motion.article
            key={index}
            initial={{ opacity: 0, scale: 0.8, rotateY: 90 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{
              duration: 0.6,
              delay: index * 0.2,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="bg-deep-purple rounded-xl p-5 border border-mystic-purple/20 text-center"
          >
            <p className="text-xs text-text-muted uppercase tracking-wider mb-3">
              {stone.positionLabel}
            </p>

            <h3 className="text-lg font-semibold text-text-primary mb-1">
              {stone.name}
            </h3>
            <p className="text-sm text-text-muted mb-2">{stone.nameEn}</p>

            {stone.isReversed && (
              <span className="inline-block bg-crimson/20 text-crimson text-xs font-medium px-2.5 py-1 rounded-full">
                逆位置
              </span>
            )}
          </motion.article>
        ))}
      </div>

      {/* Stone details */}
      <div className="space-y-4">
        {result.stones.map((stone, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
          >
            <ResultCard title={`${stone.positionLabel} - ${stone.name}`}>
              <p className="text-text-secondary leading-relaxed">
                {stone.meaning}
              </p>
            </ResultCard>
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 1.0 }}
        >
          <ResultCard title="総合メッセージ">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-celestial-gold flex-shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-text-secondary leading-relaxed">
                {result.overallMessage}
              </p>
            </div>
          </ResultCard>
        </motion.div>
      </div>

      {/* Retry button */}
      <div className="mt-8 text-center">
        <button
          onClick={retry}
          className="inline-flex items-center gap-2 bg-twilight text-text-primary border border-mystic-purple/20 rounded-lg px-6 py-3 font-medium hover:border-mystic-purple/60 transition-all duration-200 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-mystic-purple/60"
        >
          <RotateCcw className="w-4 h-4" aria-hidden="true" />
          もう一度引く
        </button>
      </div>

      <ShareButtons
        title="ルーン占い"
        text={`${result.stones.map((s) => s.name).join("・")} ${result.overallMessage}`}
      />

      <OtherFortunes current="rune" />
    </motion.div>
  );
}
