"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles, MapPin, ShieldAlert } from "lucide-react";
import { FengshuiResult } from "@/lib/types";
import { fetchFengshuiFortune } from "@/lib/api-client";
import { loadProfile, hasProfile } from "@/lib/storage";
import { UserProfile } from "@/lib/types";
import { saveToHistory, FortuneResult } from "@/lib/history";
import LoadingState from "@/components/fortune/LoadingState";
import ErrorState from "@/components/fortune/ErrorState";
import ResultCard from "@/components/fortune/ResultCard";
import ScoreDisplay from "@/components/fortune/ScoreDisplay";
import OtherFortunes from "@/components/fortune/OtherFortunes";
import ShareButtons from "@/components/fortune/ShareButtons";

export default function FengshuiPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [gender, setGender] = useState<"male" | "female">(
    (() => {
      if (typeof window === "undefined") return "male";
      try {
        const data = localStorage.getItem("fortune-compass-profile");
        if (data) {
          const p = JSON.parse(data);
          if (p.gender === "female") return "female";
        }
      } catch { /* ignore */ }
      return "male";
    })()
  );
  const [result, setResult] = useState<FengshuiResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResult = useCallback(
    async (p: UserProfile, g: "male" | "female") => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchFengshuiFortune(p, g);
        setResult(data);
        saveToHistory(data as FortuneResult);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "占い結果の取得に失敗しました"
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!hasProfile()) {
      router.replace("/profile");
      return;
    }
    const p = loadProfile();
    if (!p) return;
    setProfile(p);
    fetchResult(p, gender);
  }, [router, fetchResult, gender]);

  const handleGenderChange = (newGender: "male" | "female") => {
    if (newGender === gender) return;
    setGender(newGender);
    if (profile) {
      fetchResult(profile, newGender);
    }
  };

  if (loading && !result) {
    return <LoadingState />;
  }

  if (error && !result) {
    return (
      <ErrorState
        onRetry={() => profile && fetchResult(profile, gender)}
        message={error || "占い結果を取得できませんでした"}
      />
    );
  }

  if (!result) return null;

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
          風水占い
        </h1>
        <p className="text-text-secondary">
          {result.gua}・{result.element}
        </p>
      </div>

      {/* Gender Toggle */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <button
          onClick={() => handleGenderChange("male")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            gender === "male"
              ? "bg-mystic-purple/20 text-text-primary border border-mystic-purple/60"
              : "text-text-muted border border-mystic-purple/20 hover:border-mystic-purple/40"
          }`}
        >
          男性
        </button>
        <button
          onClick={() => handleGenderChange("female")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            gender === "female"
              ? "bg-mystic-purple/20 text-text-primary border border-mystic-purple/60"
              : "text-text-muted border border-mystic-purple/20 hover:border-mystic-purple/40"
          }`}
        >
          女性
        </button>
      </div>

      <div className="space-y-4">
        <ResultCard title="今日の運勢">
          <ScoreDisplay score={result.score} />
        </ResultCard>

        <ResultCard title="吉方位">
          <div className="flex flex-wrap gap-2">
            {result.luckyDirections.map((dir, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 bg-aurora-green/10 text-aurora-green px-3 py-1.5 rounded-full text-sm font-medium"
              >
                <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                {dir}
              </span>
            ))}
          </div>
        </ResultCard>

        <ResultCard title="凶方位">
          <div className="flex flex-wrap gap-2">
            {result.unluckyDirections.map((dir, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 bg-crimson/10 text-crimson px-3 py-1.5 rounded-full text-sm font-medium"
              >
                <ShieldAlert className="w-3.5 h-3.5" aria-hidden="true" />
                {dir}
              </span>
            ))}
          </div>
        </ResultCard>

        <ResultCard title="アドバイス">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-celestial-gold flex-shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-text-secondary leading-relaxed">
              {result.advice}
            </p>
          </div>
        </ResultCard>
      </div>

      <ShareButtons
        title={`風水占い - ${result.gua}`}
        text={`吉方位: ${result.luckyDirections.join("・")} ${result.advice}`}
      />

      <OtherFortunes current="fengshui" />
    </div>
  );
}
