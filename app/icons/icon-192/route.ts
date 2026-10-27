import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 44, background: "#07111f", color: "#63e6d4", fontSize: 90, fontWeight: 800 }}>AI</div>,
    { width: 192, height: 192 },
  );
}
