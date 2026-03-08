import type { Metadata } from "next";
import { Bebas_Neue, Manrope } from "next/font/google";

import "./globals.css";

const display = Bebas_Neue({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400"
});

const sans = Manrope({
  variable: "--font-sans",
  subsets: ["latin"]
});

export const metadata: Metadata = {
  title: "Ship by Sunday",
  description:
    "Go from idea to v1 this weekend with an action-first system for engineers who want to stop circling unfinished ideas."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
