"use client";

import Link from "next/link";
import { ArrowLeft, Sparkles, Star, Hash, Droplet, Layers } from "lucide-react";
import { motion } from "framer-motion";
import { DashboardResult } from "@/lib/types";
import { fetchDashboardFortune } from "@/lib/api-client";
import { useFortune } from "@/lib/useFortune";
import LoadingState from "@/components/fortune/LoadingState";
import ErrorState from "@/components/fortune/ErrorState";
import ResultCard from "@/components/fortune/ResultCard";
import RadarChart from "@/components/fortune/RadarChart";
import ShareButtons from "@/components/fortune/ShareButtons";

export default function DashboardPage() {
  const { result, loading, error, retry } = useFortune<DashboardResult>({
    fetcher: fetchDashboardFortune,
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

  const { radar, zodiac, numerology, bloodType, tarot } = result;

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
          総合運勢ダッシュボード
        </h1>
        <p className="text-text-secondary">
          4つの占術から導き出された今日の運勢
        </p>
      </div>

      {/* Radar Chart */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <ResultCard title="運勢レーダー">
          <RadarChart scores={radar} />
        </ResultCard>
      </motion.div>

      {/* Overall Advice */}
      <motion.div
        className="mt-4"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <ResultCard title="今日の総合アドバイス">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-celestial-gold flex-shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-text-secondary leading-relaxed">
              {result.overallAdvice}
            </p>
          </div>
        </ResultCard>
      </motion.div>

      {/* Fortune Summary Cards */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4"
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.5 } },
        }}
      >
        {/* Zodiac */}
        <motion.div variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}>
          <Link href="/fortune/zodiac" className="block group">
            <div className="bg-deep-purple rounded-xl p-5 border border-mystic-purple/20 group-hover:border-mystic-purple/60 transition-all duration-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-twilight flex items-center justify-center">
                  <Star className="w-5 h-5 text-celestial-gold" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text-primary">星座占い</h3>
                  <p className="text-xs text-text-muted">{zodiac.sign}・{zodiac.element}</p>
                </div>
                <div className="ml-auto">
                  <span className="text-lg font-bold text-celestial-gold">
                    {"★".repeat(zodiac.score)}
                    <span className="text-text-muted">{"★".repeat(5 - zodiac.score)}</span>
                  </span>
                </div>
              </div>
              <p className="text-xs text-text-secondary line-clamp-2">{zodiac.advice}</p>
            </div>
          </Link>
        </motion.div>

        {/* Numerology */}
        <motion.div variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}>
          <Link href="/fortune/numerology" className="block group">
            <div className="bg-deep-purple rounded-xl p-5 border border-mystic-purple/20 group-hover:border-mystic-purple/60 transition-all duration-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-twilight flex items-center justify-center">
                  <Hash className="w-5 h-5 text-mystic-purple" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text-primary">数秘術</h3>
                  <p className="text-xs text-text-muted">運命数 {numerology.destinyNumber}</p>
                </div>
                <div className="ml-auto flex gap-1">
                  {numerology.personalityTraits.slice(0, 2).map((trait) => (
                    <span key={trait} className="text-xs bg-twilight text-mystic-purple px-2 py-0.5 rounded-full">
                      {trait}
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-xs text-text-secondary line-clamp-2">{numerology.advice}</p>
            </div>
          </Link>
        </motion.div>

        {/* Blood Type */}
        <motion.div variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}>
          {bloodType ? (
            <Link href="/fortune/blood-type" className="block group">
              <div className="bg-deep-purple rounded-xl p-5 border border-mystic-purple/20 group-hover:border-mystic-purple/60 transition-all duration-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-twilight flex items-center justify-center">
                    <Droplet className="w-5 h-5 text-crimson" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary">血液型占い</h3>
                    <p className="text-xs text-text-muted">{bloodType.bloodType}型</p>
                  </div>
                  <div className="ml-auto">
                    <span className="text-lg font-bold text-celestial-gold">
                      {"★".repeat(bloodType.score)}
                      <span className="text-text-muted">{"★".repeat(5 - bloodType.score)}</span>
                    </span>
                  </div>
                </div>
                <p className="text-xs text-text-secondary line-clamp-2">{bloodType.advice}</p>
              </div>
            </Link>
          ) : (
            <div className="bg-deep-purple rounded-xl p-5 border border-mystic-purple/20 opacity-50">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-twilight flex items-center justify-center">
                  <Droplet className="w-5 h-5 text-text-muted" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text-primary">血液型占い</h3>
                  <p className="text-xs text-text-muted">未設定</p>
                </div>
              </div>
              <p className="text-xs text-text-muted">
                プロフィールで血液型を設定すると結果が表示されます
              </p>
            </div>
          )}
        </motion.div>

        {/* Tarot */}
        <motion.div variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}>
          <Link href="/fortune/tarot" className="block group">
            <div className="bg-deep-purple rounded-xl p-5 border border-mystic-purple/20 group-hover:border-mystic-purple/60 transition-all duration-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-twilight flex items-center justify-center">
                  <Layers className="w-5 h-5 text-aurora-green" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text-primary">タロット占い</h3>
                  <p className="text-xs text-text-muted">
                    {tarot.cards.map((c) => c.name).join("・")}
                  </p>
                </div>
              </div>
              <p className="text-xs text-text-secondary line-clamp-2">{tarot.overallMessage}</p>
            </div>
          </Link>
        </motion.div>
      </motion.div>

      <ShareButtons
        title="総合運勢ダッシュボード"
        text={`総合運: ${"★".repeat(radar.overall)} 恋愛運: ${"★".repeat(radar.love)} 仕事運: ${"★".repeat(radar.work)} 金運: ${"★".repeat(radar.money)}`}
      />
    </motion.div>
  );
}
