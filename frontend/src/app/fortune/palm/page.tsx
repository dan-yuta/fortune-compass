"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Upload, Sparkles, Heart, Brain, Activity, Star } from "lucide-react";
import { PalmResult } from "@/lib/types";
import { fetchPalmFortune } from "@/lib/api-client";
import { saveToHistory, FortuneResult } from "@/lib/history";
import ResultCard from "@/components/fortune/ResultCard";
import OtherFortunes from "@/components/fortune/OtherFortunes";
import ShareButtons from "@/components/fortune/ShareButtons";

export default function PalmPage() {
  const [preview, setPreview] = useState<string | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const [result, setResult] = useState<PalmResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("画像ファイルを選択してください。");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("ファイルサイズは5MB以下にしてください。");
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setPreview(dataUrl);
      setImageData(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!imageData) return;

    setLoading(true);
    setError(null);
    try {
      const data = await fetchPalmFortune(imageData);
      setResult(data);
      saveToHistory(data as FortuneResult);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "手相の分析に失敗しました"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPreview(null);
    setImageData(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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
          手相占い
        </h1>
        <p className="text-text-secondary">
          手のひらの写真をアップロードしてAIに手相を分析してもらいましょう
        </p>
      </div>

      {!result && (
        <div className="space-y-4 mb-8">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-mystic-purple/30 rounded-xl p-8 text-center cursor-pointer hover:border-mystic-purple/60 transition-all duration-200"
          >
            {preview ? (
              <div className="space-y-4">
                <img
                  src={preview}
                  alt="手のひらプレビュー"
                  className="max-w-xs mx-auto rounded-lg"
                />
                <p className="text-sm text-text-muted">
                  クリックして別の画像を選択
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <Upload className="w-12 h-12 text-mystic-purple/60 mx-auto" />
                <div>
                  <p className="text-text-primary font-medium">
                    手のひらの画像をアップロード
                  </p>
                  <p className="text-sm text-text-muted mt-1">
                    JPEG, PNG, WebP（5MB以下）
                  </p>
                </div>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {imageData && (
            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-mystic-purple/20 text-text-primary border border-mystic-purple/30 rounded-lg font-medium hover:bg-mystic-purple/30 hover:border-mystic-purple/60 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-mystic-purple/60"
              >
                {loading ? "分析中..." : "手相を分析する"}
              </button>
              <button
                onClick={handleReset}
                disabled={loading}
                className="px-4 py-3 text-text-secondary border border-mystic-purple/20 rounded-lg hover:border-mystic-purple/60 transition-all duration-200 disabled:opacity-50"
              >
                リセット
              </button>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="bg-crimson/10 border border-crimson/20 rounded-lg p-4 mb-6">
          <p className="text-crimson text-sm">{error}</p>
        </div>
      )}

      {loading && (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-2 border-mystic-purple/30 border-t-mystic-purple rounded-full animate-spin mb-4" />
          <p className="text-text-secondary">AIが手相を分析中...</p>
          <p className="text-sm text-text-muted mt-1">少々お待ちください</p>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <ResultCard title="総合分析">
            <p className="text-text-secondary leading-relaxed">
              {result.analysis}
            </p>
          </ResultCard>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ResultCard title="生命線">
              <div className="flex items-start gap-3">
                <Activity className="w-5 h-5 text-aurora-green flex-shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-text-secondary leading-relaxed text-sm">
                  {result.lifeLine}
                </p>
              </div>
            </ResultCard>

            <ResultCard title="頭脳線">
              <div className="flex items-start gap-3">
                <Brain className="w-5 h-5 text-mystic-purple flex-shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-text-secondary leading-relaxed text-sm">
                  {result.headLine}
                </p>
              </div>
            </ResultCard>

            <ResultCard title="感情線">
              <div className="flex items-start gap-3">
                <Heart className="w-5 h-5 text-crimson flex-shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-text-secondary leading-relaxed text-sm">
                  {result.heartLine}
                </p>
              </div>
            </ResultCard>

            <ResultCard title="運命線">
              <div className="flex items-start gap-3">
                <Star className="w-5 h-5 text-celestial-gold flex-shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-text-secondary leading-relaxed text-sm">
                  {result.fateLine}
                </p>
              </div>
            </ResultCard>
          </div>

          <ResultCard title="総合メッセージ">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-celestial-gold flex-shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-text-secondary leading-relaxed">
                {result.overallMessage}
              </p>
            </div>
          </ResultCard>

          <div className="text-center mt-6">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 bg-twilight text-text-primary border border-mystic-purple/20 rounded-lg px-6 py-3 font-medium hover:border-mystic-purple/60 transition-all duration-200 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-mystic-purple/60"
            >
              別の手相を分析する
            </button>
          </div>

          <ShareButtons
            title="手相占い"
            text={`${result.analysis} ${result.overallMessage}`}
          />

          <OtherFortunes current="palm" />
        </div>
      )}

      {!result && !loading && (
        <OtherFortunes current="palm" />
      )}
    </div>
  );
}
