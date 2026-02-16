import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Fortune Compass - 総合占いアプリ";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f0a1e 0%, #1a1333 50%, #251d3d 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <svg
          width="80"
          height="80"
          viewBox="0 0 24 24"
          fill="#f5c542"
          style={{ marginBottom: 24 }}
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: "#f0edf6",
            marginBottom: 12,
          }}
        >
          Fortune Compass
        </div>
        <div
          style={{
            fontSize: 28,
            color: "#a89ec4",
            marginBottom: 8,
          }}
        >
          あなたの運命を照らす
        </div>
        <div
          style={{
            fontSize: 20,
            color: "#6b6183",
            display: "flex",
            gap: 16,
          }}
        >
          <span>星座占い</span>
          <span>・</span>
          <span>数秘術</span>
          <span>・</span>
          <span>血液型占い</span>
          <span>・</span>
          <span>タロット</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
