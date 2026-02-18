"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles, Heart } from "lucide-react";
import { CompatibilityResult, UserProfile } from "@/lib/types";
import { fetchCompatibilityFortune } from "@/lib/api-client";
import { loadProfile, hasProfile } from "@/lib/storage";
import { saveToHistory, FortuneResult } from "@/lib/history";
import LoadingState from "@/components/fortune/LoadingState";
import ErrorState from "@/components/fortune/ErrorState";
import ResultCard from "@/components/fortune/ResultCard";
import OtherFortunes from "@/components/fortune/OtherFortunes";
import ShareButtons from "@/components/fortune/ShareButtons";

const BLOOD_TYPES = ["A", "B", "O", "AB"] as const;

export default function CompatibilityPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [result, setResult] = useState<CompatibilityResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Partner form
  const [partnerName, setPartnerName] = useState("");
  const [partnerBirthday, setPartnerBirthday] = useState("");
  const [partnerBloodType, setPartnerBloodType] = useState<string | null>(null);

  useEffect(() => {
    if (!hasProfile()) {
      router.replace("/profile");
      return;
    }
    const p = loadProfile();
    if (p) setProfile(p);
  }, [router]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!profile || !partnerBirthday) return;

      setLoading(true);
      setError(null);
      try {
        const data = await fetchCompatibilityFortune(
          profile.birthday,
          partnerBirthday,
          profile.nameRomaji,
          partnerName || undefined,
          profile.bloodType || undefined,
          partnerBloodType || undefined
        );
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
    [profile, partnerName, partnerBirthday, partnerBloodType]
  );

  if (!profile) {
    return <LoadingState />;
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
          相性占い
        </h1>
        <p className="text-text-secondary">
          二人の相性を星座・血液型・数秘術から多角的に診断します
        </p>
      </div>

      {!result && (
        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
          <div>
            <label
              htmlFor="partnerName"
              className="block text-sm font-medium text-text-primary mb-2"
            >
              相手の名前（任意）
            </label>
            <input
              id="partnerName"
              type="text"
              value={partnerName}
              onChange={(e) => setPartnerName(e.target.value)}
              placeholder="相手の名前"
              className="w-full bg-twilight border border-mystic-purple/20 rounded-lg px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-mystic-purple/60 transition-colors duration-200"
            />
          </div>

          <div>
            <label
              htmlFor="partnerBirthday"
              className="block text-sm font-medium text-text-primary mb-2"
            >
              相手の生年月日 <span className="text-crimson">*</span>
            </label>
            <input
              id="partnerBirthday"
              type="date"
              value={partnerBirthday}
              onChange={(e) => setPartnerBirthday(e.target.value)}
              required
              className="w-full bg-twilight border border-mystic-purple/20 rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-mystic-purple/60 transition-colors duration-200"
            />
          </div>

          <fieldset>
            <legend className="block text-sm font-medium text-text-primary mb-2">
              相手の血液型（任意）
            </legend>
            <div className="flex gap-3">
              {BLOOD_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() =>
                    setPartnerBloodType(
                      partnerBloodType === type ? null : type
                    )
                  }
                  aria-pressed={partnerBloodType === type}
                  className={`flex-1 py-2.5 rounded-lg font-medium transition-all duration-200 border text-sm ${
                    partnerBloodType === type
                      ? "bg-mystic-purple text-white border-mystic-purple"
                      : "bg-twilight text-text-secondary border-mystic-purple/20 hover:border-mystic-purple/40"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </fieldset>

          <button
            type="submit"
            disabled={loading || !partnerBirthday}
            className="w-full bg-gradient-to-r from-mystic-purple to-purple-700 text-white rounded-lg px-6 py-3 font-semibold hover:opacity-90 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Heart className="w-5 h-5" />
            相性を診断する
          </button>
        </form>
      )}

      {loading && <LoadingState />}

      {error && !result && (
        <ErrorState
          onRetry={() => {}}
          message={error || "占い結果を取得できませんでした"}
        />
      )}

      {result && (
        <div className="space-y-4">
          <ResultCard title="総合相性スコア">
            <div className="text-center">
              <div className="text-5xl font-bold text-celestial-gold mb-2">
                {result.overallScore}
                <span className="text-lg text-text-muted">/ 100</span>
              </div>
              <div className="w-full bg-twilight rounded-full h-3 mt-3">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-mystic-purple to-celestial-gold transition-all duration-500"
                  style={{ width: `${result.overallScore}%` }}
                />
              </div>
            </div>
          </ResultCard>

          <ResultCard title="カテゴリ別スコア">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-text-secondary text-sm">
                  星座相性（{result.person1Sign} × {result.person2Sign}）
                </span>
                <span className="text-text-primary font-semibold">
                  {result.zodiacScore}点
                </span>
              </div>
              {result.bloodTypeScore !== null && (
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary text-sm">
                    血液型相性
                  </span>
                  <span className="text-text-primary font-semibold">
                    {result.bloodTypeScore}点
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-text-secondary text-sm">
                  数秘術相性
                </span>
                <span className="text-text-primary font-semibold">
                  {result.numerologyScore}点
                </span>
              </div>
            </div>
          </ResultCard>

          <ResultCard title="アドバイス">
            <div className="flex items-start gap-3">
              <Sparkles
                className="w-5 h-5 text-celestial-gold flex-shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <p className="text-text-secondary leading-relaxed">
                {result.advice}
              </p>
            </div>
          </ResultCard>

          <ResultCard title="詳細">
            <p className="text-text-secondary leading-relaxed text-sm">
              {result.detailMessage}
            </p>
          </ResultCard>

          <button
            onClick={() => setResult(null)}
            className="w-full text-text-secondary border border-mystic-purple/20 rounded-lg px-4 py-2.5 text-sm hover:border-mystic-purple/40 transition-colors duration-200"
          >
            もう一度診断する
          </button>
        </div>
      )}

      {result && (
        <ShareButtons
          title={`相性占い - ${result.person1Sign}×${result.person2Sign}`}
          text={`総合相性: ${result.overallScore}点 ${result.advice}`}
        />
      )}

      <OtherFortunes current="compatibility" />
    </div>
  );
}
