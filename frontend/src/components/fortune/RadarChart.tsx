"use client";

import { RadarScores } from "@/lib/types";

interface RadarChartProps {
  scores: RadarScores;
  size?: number;
}

const LABELS = [
  { key: "overall" as const, label: "総合運" },
  { key: "love" as const, label: "恋愛運" },
  { key: "work" as const, label: "仕事運" },
  { key: "money" as const, label: "金運" },
];

const MAX = 5;
const LEVELS = [1, 2, 3, 4, 5];

function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleIndex: number,
  total: number
): { x: number; y: number } {
  const angle = (Math.PI * 2 * angleIndex) / total - Math.PI / 2;
  return {
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
  };
}

export default function RadarChart({ scores, size = 280 }: RadarChartProps) {
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.38;
  const n = LABELS.length;

  // Grid lines (concentric polygons)
  const gridPaths = LEVELS.map((level) => {
    const r = (level / MAX) * maxR;
    const points = Array.from({ length: n }, (_, i) =>
      polarToCartesian(cx, cy, r, i, n)
    );
    return points.map((p) => `${p.x},${p.y}`).join(" ");
  });

  // Axis lines
  const axes = Array.from({ length: n }, (_, i) =>
    polarToCartesian(cx, cy, maxR, i, n)
  );

  // Data polygon
  const dataPoints = LABELS.map((item, i) => {
    const value = scores[item.key];
    const r = (value / MAX) * maxR;
    return polarToCartesian(cx, cy, r, i, n);
  });
  const dataPath = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  // Label positions (slightly outside the chart)
  const labelPositions = LABELS.map((_, i) =>
    polarToCartesian(cx, cy, maxR + 24, i, n)
  );

  return (
    <div className="flex flex-col items-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible"
        role="img"
        aria-label={`レーダーチャート: 総合運${scores.overall}, 恋愛運${scores.love}, 仕事運${scores.work}, 金運${scores.money}`}
      >
        {/* Grid polygons */}
        {gridPaths.map((points, i) => (
          <polygon
            key={i}
            points={points}
            fill="none"
            stroke="rgba(139, 92, 246, 0.15)"
            strokeWidth={i === LEVELS.length - 1 ? 1.5 : 0.8}
          />
        ))}

        {/* Axis lines */}
        {axes.map((point, i) => (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={point.x}
            y2={point.y}
            stroke="rgba(139, 92, 246, 0.2)"
            strokeWidth={0.8}
          />
        ))}

        {/* Data area */}
        <polygon
          points={dataPath}
          fill="rgba(139, 92, 246, 0.25)"
          stroke="#8b5cf6"
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {/* Data points */}
        {dataPoints.map((point, i) => (
          <circle
            key={i}
            cx={point.x}
            cy={point.y}
            r={4}
            fill="#8b5cf6"
            stroke="#0f0a1e"
            strokeWidth={2}
          />
        ))}

        {/* Labels */}
        {LABELS.map((item, i) => {
          const pos = labelPositions[i];
          const value = scores[item.key];
          return (
            <g key={item.key}>
              <text
                x={pos.x}
                y={pos.y - 6}
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-text-primary text-xs font-semibold"
              >
                {item.label}
              </text>
              <text
                x={pos.x}
                y={pos.y + 10}
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-celestial-gold text-sm font-bold"
              >
                {value}/{MAX}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
