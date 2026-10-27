import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "AI Skills Academy",
    short_name: "AI Skills",
    description: "Learn practical AI skills through guided lessons and projects.",
    start_url: "/",
    display: "standalone",
    background_color: "#07111f",
    theme_color: "#07111f",
    icons: [
      { src: "/icons/icon-192", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512", sizes: "512x512", type: "image/png" },
    ],
  };
}
