"use client";

import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";

interface ErrorStateProps {
  onRetry: () => void;
  message?: string;
}

export default function ErrorState({ onRetry, message }: ErrorStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center py-24 animate-fade-in"
      role="alert"
    >
      <AlertCircle className="w-12 h-12 text-crimson mb-4" aria-hidden="true" />
      <p className="text-text-primary text-lg mb-2">エラーが発生しました</p>
      <p className="text-text-secondary text-sm mb-6 text-center max-w-md">
        {message || "占い結果の取得に失敗しました。もう一度お試しください。"}
      </p>
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button
          onClick={onRetry}
          className="bg-gradient-to-r from-mystic-purple to-purple-700 text-white rounded-lg px-6 py-3 font-medium hover:opacity-90 transition-all duration-200 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-mystic-purple/60"
        >
          もう一度試す
        </button>
        <Link
          href="/fortune"
          className="inline-flex items-center gap-1.5 text-text-muted hover:text-text-primary transition-colors duration-200 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          占い一覧に戻る
        </Link>
      </div>
    </div>
  );
}
