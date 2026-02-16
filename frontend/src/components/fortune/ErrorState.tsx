"use client";

import { AlertCircle } from "lucide-react";

interface ErrorStateProps {
  onRetry: () => void;
  message?: string;
}

export default function ErrorState({ onRetry, message }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
      <AlertCircle className="w-12 h-12 text-crimson mb-4" />
      <p className="text-text-primary text-lg mb-2">エラーが発生しました</p>
      <p className="text-text-secondary text-sm mb-6">
        {message || "占い結果の取得に失敗しました。もう一度お試しください。"}
      </p>
      <button
        onClick={onRetry}
        className="bg-gradient-to-r from-mystic-purple to-purple-700 text-white rounded-lg px-6 py-3 font-medium hover:opacity-90 transition-all duration-200 active:scale-[0.98]"
      >
        もう一度試す
      </button>
    </div>
  );
}
