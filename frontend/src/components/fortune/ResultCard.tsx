"use client";

interface ResultCardProps {
  title: string;
  children: React.ReactNode;
}

export default function ResultCard({ title, children }: ResultCardProps) {
  return (
    <div className="bg-deep-purple rounded-xl p-6 border border-mystic-purple/20">
      <h3 className="text-lg font-semibold text-text-primary mb-4">{title}</h3>
      <div>{children}</div>
    </div>
  );
}
