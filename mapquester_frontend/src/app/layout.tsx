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
  display: 'swap',
  preload: true,
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: 'swap',
  preload: true,
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RecoilRoot>
      <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
        <head>
          <meta 
            name="viewport" 
            content="width=device-width, initial-scale=1.0, viewport-fit=cover"
          />
        </head>
        <body className="antialiased bg-gray-100">
          <MobileContainer>
            {children}
          </MobileContainer>
        </body>
      </html>
    </RecoilRoot>
  );
}