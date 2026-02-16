"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Star, Hash, Droplet, Layers, Settings, LayoutDashboard } from "lucide-react";
import { motion } from "framer-motion";
import { getProfileSnapshot, subscribeStorage } from "@/lib/storage";
import FortuneCard from "@/components/fortune/FortuneCard";

export default function FortuneSelectionPage() {
  const router = useRouter();
  const profile = useSyncExternalStore(
    subscribeStorage,
    getProfileSnapshot,
    () => null
  );

  useEffect(() => {
    if (profile === null) {
      router.replace("/profile");
    }
  }, [profile, router]);

  if (!profile) {
    return null;
  }

  const cards = [
    { title: "星座占い", icon: Star, description: "あなたの星座から今日の運勢を占います", href: "/fortune/zodiac" },
    { title: "数秘術", icon: Hash, description: "名前と生年月日から運命数を算出します", href: "/fortune/numerology" },
    { title: "血液型占い", icon: Droplet, description: "血液型から性格と相性を占います", href: "/fortune/blood-type", disabled: !profile.bloodType, disabledMessage: "血液型が未設定です。プロフィールで設定してください。" },
    { title: "タロット占い", icon: Layers, description: "タロットカードがあなたの運命を導きます", href: "/fortune/tarot" },
  ];

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

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
        }}
      >
        {cards.map((card) => (
          <motion.div
            key={card.title}
            variants={{
              hidden: { opacity: 0, y: 20, scale: 0.97 },
              show: { opacity: 1, y: 0, scale: 1 },
            }}
          >
            <FortuneCard {...card} />
          </motion.div>
        ))}
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
