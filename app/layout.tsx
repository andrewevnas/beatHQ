// app/layout.tsx
import type { Metadata } from 'next';
import { Space_Mono } from 'next/font/google';
import { headers } from 'next/headers';
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
  const nonce = headers().get('x-nonce') ?? '';

  return (
    <html lang="en" className={spaceMono.variable}>
      <head>
        {nonce && <meta name="x-nonce" content={nonce} />}
      </head>
      <body className="bg-canvas text-ink font-mono antialiased">
        {children}
      </body>
    </html>
  );
}
