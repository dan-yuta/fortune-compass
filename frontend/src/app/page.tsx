"use client";

import { useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Star, Hash, Droplet, Layers } from "lucide-react";
import { motion } from "framer-motion";
import { getHasProfileSnapshot, subscribeStorage } from "@/lib/storage";

export default function HomePage() {
  const router = useRouter();
  const profileExists = useSyncExternalStore(
    subscribeStorage,
    getHasProfileSnapshot,
    () => false
  );

  const handleStart = () => {
    if (profileExists) {
      router.push("/fortune");
    } else {
      router.push("/profile");
    }
  };

  const features = [
    { icon: Star, label: "星座占い" },
    { icon: Hash, label: "数秘術" },
    { icon: Droplet, label: "血液型占い" },
    { icon: Layers, label: "タロット" },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
      {/* Hero section */}
      <div className="relative w-full flex flex-col items-center text-center py-16">
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(139, 92, 246, 0.15) 0%, transparent 70%)",
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <motion.div
            initial={{ scale: 0.8, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <Star className="w-16 h-16 text-celestial-gold mb-6 mx-auto" aria-hidden="true" />
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4 tracking-tight">
            Fortune Compass
          </h1>

          <p className="text-xl text-text-secondary mb-2">
            あなたの運命を照らす
          </p>

          <p className="text-xs text-text-muted mb-10">
            ver 1.00
          </p>

          <motion.button
            onClick={handleStart}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="bg-gradient-to-r from-mystic-purple to-purple-700 text-white rounded-lg px-8 py-4 text-lg font-semibold hover:opacity-90 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-mystic-purple/60"
          >
            占いをはじめる
          </motion.button>
        </motion.div>
      </div>

      {/* Feature icons */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-16 w-full max-w-lg"
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.4 } },
        }}
      >
        {features.map(({ icon: Icon, label }) => (
          <motion.div
            key={label}
            className="flex flex-col items-center gap-2 text-center"
            variants={{
              hidden: { opacity: 0, y: 16 },
              show: { opacity: 1, y: 0 },
            }}
          >
            <div className="w-14 h-14 rounded-xl bg-deep-purple border border-mystic-purple/20 flex items-center justify-center">
              <Icon className="w-7 h-7 text-mystic-purple" aria-hidden="true" />
            </div>
            <span className="text-sm text-text-secondary">{label}</span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
