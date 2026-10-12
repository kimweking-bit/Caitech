import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** CAITECH Apple touch icon — deep teal, lime bar, white C. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#12343B",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 10,
            background: "#C7F000",
          }}
        />
        <span
          style={{
            color: "#F5F5F0",
            fontSize: 110,
            fontWeight: 600,
            fontFamily: "Georgia, 'Times New Roman', serif",
            lineHeight: 1,
            marginTop: 8,
          }}
        >
          C
        </span>
      </div>
    ),
    { ...size },
  );
}
