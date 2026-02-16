"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles, Palette, Gift } from "lucide-react";
import { loadProfile, hasProfile } from "@/lib/storage";
import { UserProfile, ZodiacResult } from "@/lib/types";
import { fetchZodiacFortune } from "@/lib/api-client";
import LoadingState from "@/components/fortune/LoadingState";
import ErrorState from "@/components/fortune/ErrorState";
import ResultCard from "@/components/fortune/ResultCard";
import ScoreDisplay from "@/components/fortune/ScoreDisplay";

export default function ZodiacPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [result, setResult] = useState<ZodiacResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResult = useCallback(async (p: UserProfile) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchZodiacFortune(p);
      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "占い結果の取得に失敗しました"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hasProfile()) {
      router.replace("/profile");
      return;
    }
    const p = loadProfile();
    if (p) {
      setProfile(p);
      fetchResult(p);
    }
  }, [router, fetchResult]);

  const handleRetry = () => {
    if (profile) {
      fetchResult(profile);
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState onRetry={handleRetry} message={error} />;
  }

  if (!result) {
    return null;
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
          星座占い
        </h1>
        <p className="text-text-secondary">
          {result.sign}（{result.signEn}）・{result.element}
        </p>
      </div>

      <div className="space-y-4">
        {/* Score */}
        <ResultCard title="今日の運勢">
          <ScoreDisplay score={result.score} />
        </ResultCard>

        {/* Lucky items */}
        <ResultCard title="ラッキーアイテム">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Palette className="w-5 h-5 text-mystic-purple flex-shrink-0" />
              <div>
                <p className="text-xs text-text-muted">ラッキーカラー</p>
                <p className="text-text-primary font-medium">
                  {result.luckyColor}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Gift className="w-5 h-5 text-celestial-gold flex-shrink-0" />
              <div>
                <p className="text-xs text-text-muted">ラッキーアイテム</p>
                <p className="text-text-primary font-medium">
                  {result.luckyItem}
                </p>
              </div>
            </div>
          </div>
        </ResultCard>

        {/* Advice */}
        <ResultCard title="アドバイス">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-celestial-gold flex-shrink-0 mt-0.5" />
            <p className="text-text-secondary leading-relaxed">
              {result.advice}
            </p>
          </div>
        </ResultCard>
      </div>

      {/* Navigation */}
      <div className="mt-8 text-center">
        <Link
          href="/fortune"
          className="inline-block bg-gradient-to-r from-mystic-purple to-purple-700 text-white rounded-lg px-6 py-3 font-medium hover:opacity-90 transition-all duration-200 active:scale-[0.98]"
        >
          他の占いを試す
        </Link>
      </div>
    </div>
  );
}
