"use client";

import { TrendDay } from "@/lib/types";

interface TrendChartProps {
  days: TrendDay[];
  width?: number;
  height?: number;
}

const CATEGORIES = [
  { key: "overall" as const, label: "総合", color: "#8b5cf6" },
  { key: "love" as const, label: "恋愛", color: "#ec4899" },
  { key: "work" as const, label: "仕事", color: "#3b82f6" },
  { key: "money" as const, label: "金運", color: "#f59e0b" },
];

const MAX = 5;

export default function TrendChart({
  days,
  width = 320,
  height = 200,
}: TrendChartProps) {
  const paddingLeft = 30;
  const paddingRight = 10;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const xStep = chartWidth / (days.length - 1);

  function getX(index: number): number {
    return paddingLeft + index * xStep;
  }

  function getY(value: number): number {
    return paddingTop + chartHeight - (value / MAX) * chartHeight;
  }

  function buildPath(key: "overall" | "love" | "work" | "money"): string {
    return days
      .map((day, i) => {
        const x = getX(i);
        const y = getY(day[key]);
        return `${i === 0 ? "M" : "L"}${x},${y}`;
      })
      .join(" ");
  }

  // Grid lines
  const gridLines = [1, 2, 3, 4, 5].map((level) => getY(level));

  return (
    <div className="flex flex-col items-center gap-3">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible w-full max-w-full"
        style={{ aspectRatio: `${width}/${height}` }}
        role="img"
        aria-label="7日間の運勢トレンドチャート"
      >
        {/* Grid lines */}
        {gridLines.map((y, i) => (
          <g key={i}>
            <line
              x1={paddingLeft}
              y1={y}
              x2={paddingLeft + chartWidth}
              y2={y}
              stroke="rgba(139, 92, 246, 0.1)"
              strokeWidth={0.8}
            />
            <text
              x={paddingLeft - 6}
              y={y + 4}
              textAnchor="end"
              className="fill-text-muted"
              fontSize={10}
            >
              {i + 1}
            </text>
          </g>
        ))}

        {/* Category lines */}
        {CATEGORIES.map((cat) => (
          <path
            key={cat.key}
            d={buildPath(cat.key)}
            fill="none"
            stroke={cat.color}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ))}

        {/* Data points for overall */}
        {days.map((day, i) => (
          <circle
            key={i}
            cx={getX(i)}
            cy={getY(day.overall)}
            r={3}
            fill="#8b5cf6"
            stroke="#0f0a1e"
            strokeWidth={1.5}
          />
        ))}

        {/* Today indicator */}
        {days.map((day, i) =>
          day.dayLabel === "今日" ? (
            <line
              key={`today-${i}`}
              x1={getX(i)}
              y1={paddingTop}
              x2={getX(i)}
              y2={paddingTop + chartHeight}
              stroke="rgba(139, 92, 246, 0.3)"
              strokeWidth={1}
              strokeDasharray="4 2"
            />
          ) : null
        )}

        {/* X axis labels */}
        {days.map((day, i) => (
          <text
            key={i}
            x={getX(i)}
            y={height - 6}
            textAnchor="middle"
            className={
              day.dayLabel === "今日"
                ? "fill-text-primary font-semibold"
                : "fill-text-muted"
            }
            fontSize={10}
          >
            {day.dayLabel}
          </text>
        ))}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 justify-center">
        {CATEGORIES.map((cat) => (
          <div key={cat.key} className="flex items-center gap-1.5">
            <span
              className="inline-block w-3 h-0.5 rounded"
              style={{ backgroundColor: cat.color }}
            />
            <span className="text-xs text-text-muted">{cat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
