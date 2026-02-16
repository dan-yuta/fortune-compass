"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles, Users } from "lucide-react";
import { loadProfile, hasProfile } from "@/lib/storage";
import { UserProfile, NumerologyResult } from "@/lib/types";
import { fetchNumerologyFortune } from "@/lib/api-client";
import LoadingState from "@/components/fortune/LoadingState";
import ErrorState from "@/components/fortune/ErrorState";
import ResultCard from "@/components/fortune/ResultCard";

export default function NumerologyPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [result, setResult] = useState<NumerologyResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResult = useCallback(async (p: UserProfile) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchNumerologyFortune(p);
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
          数秘術
        </h1>
        <p className="text-text-secondary">
          あなたの運命数から導き出された結果です
        </p>
      </div>

      <div className="space-y-4">
        {/* Destiny Number */}
        <ResultCard title="運命数">
          <div className="flex items-center justify-center py-4">
            <span className="text-6xl font-bold text-celestial-gold">
              {result.destinyNumber}
            </span>
          </div>
        </ResultCard>

        {/* Personality Traits */}
        <ResultCard title="性格特性">
          <div className="flex flex-wrap gap-2">
            {result.personalityTraits.map((trait, index) => (
              <span
                key={index}
                className="inline-block bg-twilight text-mystic-purple px-3 py-1.5 rounded-full text-sm font-medium border border-mystic-purple/20"
              >
                {trait}
              </span>
            ))}
          </div>
        </ResultCard>

        {/* Year Fortune */}
        <ResultCard title="年間運勢">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-celestial-gold flex-shrink-0 mt-0.5" />
            <p className="text-text-secondary leading-relaxed">
              {result.yearFortune}
            </p>
          </div>
        </ResultCard>

        {/* Compatibility */}
        <ResultCard title="相性の良い運命数">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-mystic-purple flex-shrink-0" />
            <div className="flex gap-2">
              {result.compatibility.map((num) => (
                <span
                  key={num}
                  className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-twilight border border-mystic-purple/20 text-celestial-gold font-bold"
                >
                  {num}
                </span>
              ))}
            </div>
          </div>
        </ResultCard>

        {/* Advice */}
        <ResultCard title="アドバイス">
          <p className="text-text-secondary leading-relaxed">{result.advice}</p>
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
