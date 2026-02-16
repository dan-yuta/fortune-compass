"use client";

import { useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Star, Hash, Droplet, Layers } from "lucide-react";
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
        {/* Radial gradient background */}
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(139, 92, 246, 0.15) 0%, transparent 70%)",
          }}
        />

        <div className="animate-fade-in">
          <Star className="w-16 h-16 text-celestial-gold mb-6 mx-auto" aria-hidden="true" />

          <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4 tracking-tight">
            Fortune Compass
          </h1>

          <p className="text-xl text-text-secondary mb-10">
            あなたの運命を照らす
          </p>

          <button
            onClick={handleStart}
            className="bg-gradient-to-r from-mystic-purple to-purple-700 text-white rounded-lg px-8 py-4 text-lg font-semibold hover:opacity-90 transition-all duration-200 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-mystic-purple/60"
          >
            占いをはじめる
          </button>
        </div>
      </div>

      {/* Feature icons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-16 w-full max-w-lg">
        {features.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-2 text-center"
          >
            <div className="w-14 h-14 rounded-xl bg-deep-purple border border-mystic-purple/20 flex items-center justify-center">
              <Icon className="w-7 h-7 text-mystic-purple" aria-hidden="true" />
            </div>
            <span className="text-sm text-text-secondary">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
