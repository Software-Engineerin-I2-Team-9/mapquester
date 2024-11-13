'use client'

// import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

import { RecoilRoot } from 'recoil';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RecoilRoot>
      <html lang="en">
        <link href="https://fonts.googleapis.com/css2?family=Pacifico&display=swap" rel="stylesheet"/>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
            {children}
        </body>
      </html>
    </RecoilRoot>
  );
}
