import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "buildarc — your build story, recovered";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#0A0A0A",
        padding: "60px 80px",
      }}
    >
      {/* Accent line */}
      <div
        style={{
          width: 64,
          height: 3,
          backgroundColor: "#00E5B3",
          marginBottom: 40,
        }}
      />

      {/* Title */}
      <div
        style={{
          fontSize: 96,
          fontFamily: "Georgia, serif",
          fontStyle: "italic",
          color: "#F5F5F0",
          letterSpacing: "-2px",
          lineHeight: 1,
        }}
      >
        buildarc
      </div>

      {/* Tagline */}
      <div
        style={{
          fontSize: 28,
          fontFamily: "Georgia, serif",
          fontStyle: "italic",
          color: "#8A9EA0",
          marginTop: 24,
        }}
      >
        Your build story, recovered.
      </div>

      {/* Command block */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginTop: 48,
          padding: "16px 32px",
          backgroundColor: "#111111",
          borderRadius: 8,
          border: "1px solid #222222",
        }}
      >
        <span
          style={{
            fontSize: 22,
            fontFamily: "monospace",
            color: "#00E5B3",
            marginRight: 12,
          }}
        >
          $
        </span>
        <span
          style={{
            fontSize: 22,
            fontFamily: "monospace",
            color: "#F5F5F0",
          }}
        >
          npx buildarc
        </span>
      </div>
    </div>,
    { ...size },
  );
}
