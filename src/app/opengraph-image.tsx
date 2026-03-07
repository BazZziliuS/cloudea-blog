import { ImageResponse } from "next/og";
import { getConfig } from "@/lib/config";

const config = getConfig();

export const alt = config.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0a",
          backgroundImage:
            "radial-gradient(circle at 25% 25%, #1a1a2e 0%, transparent 50%), radial-gradient(circle at 75% 75%, #16213e 0%, transparent 50%)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <h1
            style={{
              fontSize: 72,
              fontWeight: 800,
              color: "#ffffff",
              letterSpacing: "-0.05em",
              lineHeight: 1,
            }}
          >
            {config.title}
          </h1>
          <p
            style={{
              fontSize: 28,
              color: "#a1a1aa",
              marginTop: 16,
            }}
          >
            {config.tagline}
          </p>
        </div>
      </div>
    ),
    { ...size }
  );
}
