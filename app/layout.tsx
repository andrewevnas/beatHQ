// app/layout.tsx
import type { Metadata } from 'next';
import { Space_Mono } from 'next/font/google';
import './globals.css';

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-space-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: process.env['NEXT_PUBLIC_SITE_NAME'] ?? 'BeatHQ',
  description: 'Independent beat store',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={spaceMono.variable}>
      <body className="bg-canvas text-ink font-mono antialiased">
        {children}
      </body>
    </html>
  );
}
