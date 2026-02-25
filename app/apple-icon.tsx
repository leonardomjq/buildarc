import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#0A0A0A",
        borderRadius: 36,
      }}
    >
      <span
        style={{
          fontSize: 120,
          fontFamily: "Georgia, serif",
          fontStyle: "italic",
          fontWeight: 700,
          color: "#00E5B3",
          lineHeight: 1,
          marginTop: -8,
        }}
      >
        b
      </span>
    </div>,
    { ...size },
  );
}
