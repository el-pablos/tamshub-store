import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import { Navbar, Footer, FloatingChat } from "@/components/layout";
import { PixelBlast } from "@/components/effects";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TamsHub Store | Top Up Game & Layanan Digital",
  description:
    "Platform top up game dan layanan digital terpercaya, cepat, dan aman. Proses otomatis 24/7 dengan harga bersaing.",
  keywords: ["top up game", "mobile legends", "free fire", "genshin impact", "voucher game"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <Providers>
          <PixelBlast />
          <Navbar />
          <main className="flex-1 pt-16">{children}</main>
          <Footer />
          <FloatingChat />
        </Providers>
      </body>
    </html>
  );
}
