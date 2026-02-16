"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Settings, LayoutDashboard } from "lucide-react";
import { motion } from "framer-motion";
import { getProfileSnapshot, subscribeStorage } from "@/lib/storage";
import FortuneCard from "@/components/fortune/FortuneCard";
import {
  fortuneRegistry,
  categoryOrder,
  categoryLabels,
  type FortuneCategory,
} from "@/lib/fortune-registry";

export default function FortuneSelectionPage() {
  const router = useRouter();
  const profile = useSyncExternalStore(
    subscribeStorage,
    getProfileSnapshot,
    () => null
  );
  const [activeCategory, setActiveCategory] = useState<FortuneCategory>("classic");

  useEffect(() => {
    if (profile === null) {
      router.replace("/profile");
    }
  }, [profile, router]);

  if (!profile) {
    return null;
  }

  const filteredFortunes = fortuneRegistry.filter(
    (f) => f.category === activeCategory
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">
          こんにちは、{profile.name}さん
        </h1>
        <p className="text-text-secondary">
          今日の占いを選んでください
        </p>
      </div>

      {/* Dashboard Banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <Link
          href="/fortune/dashboard"
          className="block bg-gradient-to-r from-mystic-purple/20 to-purple-900/20 rounded-xl p-5 border border-mystic-purple/30 hover:border-mystic-purple/60 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-mystic-purple/60"
        >
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-mystic-purple/20 flex items-center justify-center">
              <LayoutDashboard className="w-6 h-6 text-celestial-gold" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-text-primary">
                総合運勢ダッシュボード
              </h3>
              <p className="text-sm text-text-secondary">
                4つの占術を一括実行してレーダーチャートで運勢を可視化
              </p>
            </div>
          </div>
        </Link>
      </motion.div>

      {/* Category Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
        {categoryOrder.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
              activeCategory === cat
                ? "bg-mystic-purple/20 text-text-primary border border-mystic-purple/60"
                : "text-text-muted border border-mystic-purple/20 hover:border-mystic-purple/40 hover:text-text-secondary"
            }`}
          >
            {categoryLabels[cat]}
          </button>
        ))}
      </div>

      <motion.div
        key={activeCategory}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
        }}
      >
        {filteredFortunes.map((fortune) => {
          const isBloodType = fortune.id === "blood-type";
          return (
            <motion.div
              key={fortune.id}
              variants={{
                hidden: { opacity: 0, y: 20, scale: 0.97 },
                show: { opacity: 1, y: 0, scale: 1 },
              }}
            >
              <FortuneCard
                title={fortune.label}
                icon={fortune.icon}
                description={fortune.description}
                href={fortune.path}
                disabled={isBloodType && !profile.bloodType}
                disabledMessage={
                  isBloodType && !profile.bloodType
                    ? "血液型が未設定です。プロフィールで設定してください。"
                    : undefined
                }
              />
            </motion.div>
          );
        })}
      </motion.div>

      <motion.div
        className="mt-8 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 text-text-secondary hover:text-mystic-purple transition-colors duration-200"
        >
          <Settings className="w-4 h-4" aria-hidden="true" />
          <span className="text-sm">プロフィール編集</span>
        </Link>
      </motion.div>
    </motion.div>
  );
}
