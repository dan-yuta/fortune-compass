"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Sparkles, Tag } from "lucide-react";
import { DreamResult } from "@/lib/types";
import { fetchDreamFortune } from "@/lib/api-client";
import { saveToHistory, FortuneResult } from "@/lib/history";
import ResultCard from "@/components/fortune/ResultCard";
import ScoreDisplay from "@/components/fortune/ScoreDisplay";
import OtherFortunes from "@/components/fortune/OtherFortunes";
import ShareButtons from "@/components/fortune/ShareButtons";

export default function DreamPage() {
  const [keyword, setKeyword] = useState("");
  const [result, setResult] = useState<DreamResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const data = await fetchDreamFortune(keyword.trim());
      setResult(data);
      saveToHistory(data as FortuneResult);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "占い結果の取得に失敗しました"
      );
    } finally {
      setLoading(false);
    }
  };

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
          夢占い
        </h1>
        <p className="text-text-secondary">
          夢に出てきたキーワードを入力してください
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="例: 海、猫、飛ぶ、花..."
              className="w-full pl-10 pr-4 py-3 bg-deep-purple border border-mystic-purple/20 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-mystic-purple/60 focus:border-mystic-purple/60 transition-all duration-200"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !keyword.trim()}
            className="px-6 py-3 bg-mystic-purple/20 text-text-primary border border-mystic-purple/30 rounded-lg font-medium hover:bg-mystic-purple/30 hover:border-mystic-purple/60 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-mystic-purple/60"
          >
            {loading ? "占い中..." : "占う"}
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-crimson/10 border border-crimson/20 rounded-lg p-4 mb-6">
          <p className="text-crimson text-sm">{error}</p>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <ResultCard title={`「${result.keyword}」の夢`}>
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-4 h-4 text-mystic-purple" aria-hidden="true" />
              <span className="text-sm text-mystic-purple font-medium">
                {result.category}
              </span>
            </div>
            <p className="text-text-secondary leading-relaxed">
              {result.meaning}
            </p>
          </ResultCard>

          <ResultCard title="今日の運勢">
            <ScoreDisplay score={result.score} />
          </ResultCard>

          <ResultCard title="アドバイス">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-celestial-gold flex-shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-text-secondary leading-relaxed">
                {result.advice}
              </p>
            </div>
          </ResultCard>

          <ShareButtons
            title={`夢占い - ${result.keyword}`}
            text={`「${result.keyword}」の夢: ${result.meaning}`}
          />

          <OtherFortunes current="dream" />
        </div>
      )}

      {!result && !loading && (
        <OtherFortunes current="dream" />
      )}
    </div>
  );
}
