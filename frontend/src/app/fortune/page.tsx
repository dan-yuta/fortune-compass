"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Star, Hash, Droplet, Layers, Settings } from "lucide-react";
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

  return (
    <div className="animate-fade-in">
      {/* User greeting */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">
          こんにちは、{profile.name}さん
        </h1>
        <p className="text-text-secondary">
          今日の占いを選んでください
        </p>
      </div>

      {/* Fortune cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FortuneCard
          title="星座占い"
          icon={Star}
          description="あなたの星座から今日の運勢を占います"
          href="/fortune/zodiac"
        />
        <FortuneCard
          title="数秘術"
          icon={Hash}
          description="名前と生年月日から運命数を算出します"
          href="/fortune/numerology"
        />
        <FortuneCard
          title="血液型占い"
          icon={Droplet}
          description="血液型から性格と相性を占います"
          href="/fortune/blood-type"
          disabled={!profile.bloodType}
          disabledMessage="血液型が未設定です。プロフィールで設定してください。"
        />
        <FortuneCard
          title="タロット占い"
          icon={Layers}
          description="タロットカードがあなたの運命を導きます"
          href="/fortune/tarot"
        />
      </div>

      {/* Profile edit link */}
      <div className="mt-8 text-center">
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 text-text-secondary hover:text-mystic-purple transition-colors duration-200"
        >
          <Settings className="w-4 h-4" aria-hidden="true" />
          <span className="text-sm">プロフィール編集</span>
        </Link>
      </div>
    </div>
  );
}
