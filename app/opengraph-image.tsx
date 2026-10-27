import { ImageResponse } from "next/og";

export const alt = "AI Skills Academy — practical AI learning";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: "#07111f", color: "#edf5ff", fontFamily: "sans-serif" }}>
        <div style={{ fontSize: 24, letterSpacing: 8, color: "#63e6d4" }}>AI SKILLS ACADEMY</div>
        <div style={{ marginTop: 36, fontSize: 68, lineHeight: 1.08, fontWeight: 700 }}>Learn AI skills.</div>
        <div style={{ fontSize: 68, lineHeight: 1.08, fontWeight: 700, color: "#63e6d4" }}>Build what’s next.</div>
        <div style={{ marginTop: 28, fontSize: 26, color: "#9db0c8" }}>Prompting · AI video · Design · Websites · Digital products</div>
      </div>
    ),
    size,
  );
}
