import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/** CAITECH browser favicon mark — deep teal, lime bar, white C. */
export default function Icon() {
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
            height: 3,
            background: "#C7F000",
          }}
        />
        <span
          style={{
            color: "#F5F5F0",
            fontSize: 18,
            fontWeight: 600,
            fontFamily: "Georgia, 'Times New Roman', serif",
            lineHeight: 1,
            marginTop: 2,
          }}
        >
          C
        </span>
      </div>
    ),
    { ...size },
  );
}
