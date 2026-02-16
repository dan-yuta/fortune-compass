"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles, Heart } from "lucide-react";
import { loadProfile, hasProfile } from "@/lib/storage";
import { UserProfile, BloodTypeResult } from "@/lib/types";
import { fetchBloodTypeFortune } from "@/lib/api-client";
import LoadingState from "@/components/fortune/LoadingState";
import ErrorState from "@/components/fortune/ErrorState";
import ResultCard from "@/components/fortune/ResultCard";
import ScoreDisplay from "@/components/fortune/ScoreDisplay";

export default function BloodTypePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [result, setResult] = useState<BloodTypeResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResult = useCallback(async (p: UserProfile) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchBloodTypeFortune(p);
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
    if (!p || !p.bloodType) {
      router.replace("/fortune");
      return;
    }
    setProfile(p);
    fetchResult(p);
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
          血液型占い
        </h1>
        <p className="text-text-secondary">
          {result.bloodType}型のあなたの運勢
        </p>
      </div>

      <div className="space-y-4">
        {/* Score */}
        <ResultCard title="今日の運勢">
          <ScoreDisplay score={result.score} />
        </ResultCard>

        {/* Personality */}
        <ResultCard title="性格">
          <p className="text-text-secondary leading-relaxed">
            {result.personality}
          </p>
        </ResultCard>

        {/* Compatibility Ranking */}
        <ResultCard title="相性ランキング">
          <div className="space-y-3">
            {result.compatibilityRanking.map((type, index) => (
              <div key={type} className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-twilight border border-mystic-purple/20">
                  <span
                    className={`text-sm font-bold ${
                      index === 0
                        ? "text-celestial-gold"
                        : index === 1
                          ? "text-aurora-green"
                          : "text-text-secondary"
                    }`}
                  >
                    {index + 1}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart
                    className={`w-4 h-4 ${
                      index === 0
                        ? "text-crimson fill-crimson"
                        : "text-text-muted"
                    }`}
                  />
                  <span className="text-text-primary font-medium">
                    {type}型
                  </span>
                </div>
              </div>
            ))}
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
