import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Skyline Watch — Real-time alerts on sale & rent listings worth chasing",
  description:
    "Skyline Watch ingests every relevant sale and rent listing in your target city, scores it against a market baseline, and pushes the matches inside minutes — by email and Telegram. The market-watch terminal for serious buyers, renters, and investors.",
  metadataBase: new URL("https://real-estate-monitor.prin7r.com"),
  openGraph: {
    title: "Skyline Watch — alerts on listings worth chasing",
    description:
      "Real-time scoring of sale + rent listings in your target city. Push notifications within minutes of price movements, freshness, and high-quality matches.",
    url: "https://real-estate-monitor.prin7r.com",
    type: "website",
  },
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..600&family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
