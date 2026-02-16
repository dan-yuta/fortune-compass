import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] text-center">
      <Compass className="w-20 h-20 text-mystic-purple mb-6 animate-pulse" aria-hidden="true" />
      <h1 className="text-4xl font-bold text-text-primary mb-3">404</h1>
      <p className="text-xl text-text-secondary mb-2">ページが見つかりません</p>
      <p className="text-text-muted mb-8">
        お探しのページは存在しないか、移動された可能性があります。
      </p>
      <Link
        href="/"
        className="bg-gradient-to-r from-mystic-purple to-purple-700 text-white rounded-lg px-8 py-3 font-semibold hover:opacity-90 transition-all duration-200 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-mystic-purple/60"
      >
        トップページに戻る
      </Link>
    </div>
  );
}
