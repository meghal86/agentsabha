import type { Metadata } from "next";
import { DM_Sans, Noto_Sans_Devanagari, Playfair_Display, Tiro_Devanagari_Hindi } from "next/font/google";

import "@/app/globals.css";

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", weight: ["600", "700", "800"] });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans", weight: ["400", "500", "700"] });
const tiro = Tiro_Devanagari_Hindi({ subsets: ["latin"], variable: "--font-tiro", weight: ["400"] });
const noto = Noto_Sans_Devanagari({ subsets: ["latin"], variable: "--font-noto-devanagari", weight: ["400", "500", "700"] });

export const metadata: Metadata = {
  title: "AgentSabha",
  description: "543 AI Agents. One Parliament. A Billion Voices."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable} ${tiro.variable} ${noto.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Playfair+Display:wght@600;700;800&family=Tiro+Devanagari+Hindi:ital,wght@0,400;0,600;1,400&family=Noto+Sans+Devanagari:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="/app-prototype.css" />
      </head>
      <body className="screen-page">{children}</body>
    </html>
  );
}
