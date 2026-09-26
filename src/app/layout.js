import "./globals.css";
import Providers from "@/components/Providers";

const SITE_URL = "https://kitaabistan.app"; // update once the real domain is live

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Kitaabistan — Offline Bilingual Library for Students",
    template: "%s · Kitaabistan",
  },
  description:
    "A free, offline-first Urdu/English library and curated AI chatbot for students — novels, Islamic books, children's stories, moral stories, poems, animated books, and general knowledge, all readable with zero internet.",
  applicationName: "Kitaabistan",
  manifest: "/manifest.json",
  keywords: [
    "Urdu books app",
    "offline reading app",
    "bilingual library",
    "Islamic books app",
    "Urdu poems English translation",
    "student reading app Pakistan",
    "offline chatbot for students",
  ],
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.png",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Kitaabistan",
    title: "Kitaabistan — Offline Bilingual Library for Students",
    description:
      "Novels, Islamic books, children's & moral stories, bilingual poems, and a safe curated AI chatbot — all free and readable with zero internet.",
    locale: "en_PK",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kitaabistan — Offline Bilingual Library for Students",
    description:
      "A free, offline-first Urdu/English library and curated AI chatbot for students.",
  },
  robots: { index: true, follow: true },
};

export const viewport = {
  themeColor: "#0e5c4c",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Noto+Nastaliq+Urdu:wght@400;700&family=Noto+Naskh+Arabic:wght@400;500;600;700&family=Lexend:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
