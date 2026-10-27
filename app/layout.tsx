import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "../src/styles.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

const siteUrl = "https://ai-skills-academy-eosin.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "AI Skills Academy | Master Practical AI & Automation Skills",
    template: "%s | AI Skills Academy",
  },
  description:
    "Learn practical AI prompting, video creation, graphic design, website building and digital products through guided, hands-on lessons.",
  applicationName: "AI Skills Academy",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "AI Skills Academy",
    title: "AI Skills Academy | Master Practical AI & Automation Skills",
    description:
      "Build practical AI skills with guided lessons, projects and learning pathways.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "AI Skills Academy — practical AI learning" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Skills Academy | Master Practical AI & Automation Skills",
    description:
      "Learn practical AI skills through guided lessons and hands-on projects.",
    images: ["/opengraph-image"],
  },
  icons: {
    icon: [{ url: "/icon", type: "image/png", sizes: "64x64" }],
    apple: [{ url: "/apple-icon", type: "image/png", sizes: "180x180" }],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#07111f",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geist.variable} ${geistMono.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
