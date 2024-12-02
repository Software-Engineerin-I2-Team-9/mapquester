// src/app/layout.tsx
'use client'

import localFont from "next/font/local";
import "./globals.css";
import MobileContainer from '../components/MobileContainer';
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
        <head>
          <link href="https://fonts.googleapis.com/css2?family=Pacifico&display=swap" rel="stylesheet"/>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        </head>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-100`}>
          <MobileContainer>
            {children}
          </MobileContainer>
        </body>
      </html>
    </RecoilRoot>
  );
}