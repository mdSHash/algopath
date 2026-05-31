// Auto-generated 1200x630 social-share card.
// Next.js 16 picks this up via the app/opengraph-image convention and
// renders it at build time, so it appears as the preview when the site is
// shared on Twitter/LinkedIn/Discord/etc.

import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "AlgoPath — Logic-first coding practice with AI tutoring";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background:
            "linear-gradient(135deg, #050505 0%, #0a0a0a 40%, #052e22 100%)",
          color: "#f5f5f5",
          padding: "70px 80px",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* Faint grid backdrop */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(16,185,129,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.06) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            display: "flex",
          }}
        />

        {/* Top row: brand mark + name */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 14,
              background:
                "linear-gradient(180deg, #34d399 0%, #059669 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 38,
              fontWeight: 800,
              color: "#0a0a0a",
              letterSpacing: -1,
            }}
          >
            {"{ }"}
          </div>
          <div
            style={{
              fontSize: 30,
              fontWeight: 600,
              letterSpacing: -0.5,
              display: "flex",
            }}
          >
            Algo
            <span style={{ color: "#34d399" }}>Path</span>
          </div>
        </div>

        {/* Eyebrow chip */}
        <div
          style={{
            display: "flex",
            alignSelf: "flex-start",
            padding: "8px 16px",
            borderRadius: 999,
            border: "1px solid rgba(52, 211, 153, 0.35)",
            background: "rgba(16, 185, 129, 0.08)",
            color: "#6ee7b7",
            fontSize: 18,
            fontWeight: 500,
            marginBottom: 26,
          }}
        >
          ✨ Logic-first coding practice with AI tutoring
        </div>

        {/* Big headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 80,
            fontWeight: 800,
            letterSpacing: -2.5,
            lineHeight: 1.04,
            marginBottom: 28,
          }}
        >
          <span>Stop Copying Solutions.</span>
          <span
            style={{
              background:
                "linear-gradient(90deg, #6ee7b7 0%, #34d399 50%, #059669 100%)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Start Thinking.
          </span>
        </div>

        {/* Subhead */}
        <div
          style={{
            display: "flex",
            fontSize: 28,
            color: "#a3a3a3",
            maxWidth: 950,
            lineHeight: 1.35,
            marginBottom: 40,
          }}
        >
          The code editor stays locked until an AI reviews your written approach.
          Build real algorithmic thinking — not muscle memory.
        </div>

        {/* Phase chips */}
        <div
          style={{
            display: "flex",
            gap: 14,
            alignItems: "center",
            marginTop: "auto",
          }}
        >
          {[
            { label: "📖 Understand", muted: true },
            { label: "🧠 Logic", muted: false },
            { label: "💻 Code", muted: true },
            { label: "✅ Done", muted: true },
          ].map((p, i) => (
            <div key={p.label} style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  display: "flex",
                  padding: "10px 18px",
                  borderRadius: 10,
                  border: p.muted
                    ? "1px solid #2a2a2a"
                    : "1px solid rgba(52, 211, 153, 0.5)",
                  background: p.muted ? "#111" : "rgba(16, 185, 129, 0.12)",
                  color: p.muted ? "#737373" : "#6ee7b7",
                  fontSize: 22,
                  fontWeight: 500,
                }}
              >
                {p.label}
              </div>
              {i < 3 && (
                <div
                  style={{
                    width: 28,
                    height: 1,
                    background: p.muted ? "#2a2a2a" : "#10b981",
                    margin: "0 6px",
                    display: "flex",
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Footer right: tech badges */}
        <div
          style={{
            position: "absolute",
            right: 80,
            bottom: 70,
            display: "flex",
            gap: 14,
            fontSize: 18,
            color: "#525252",
            alignItems: "center",
          }}
        >
          <span>Next.js 16</span>
          <span style={{ color: "#2a2a2a" }}>·</span>
          <span>Gemini</span>
          <span style={{ color: "#2a2a2a" }}>·</span>
          <span>Postgres</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
