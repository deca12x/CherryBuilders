import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";
import { Analytics } from "@vercel/analytics/react";
import BottomNavigationBar from "@/components/navbar/BottomNavigationBar";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cherry",
  description: "A webapp to meet new developers, connect with them and start great collaborations",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
          <BottomNavigationBar />
        </Providers>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
