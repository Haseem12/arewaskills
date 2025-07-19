import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Northern Tech Exchange - Dev & AI Hangout',
  description: 'An exclusive gathering of tech enthusiasts and professionals in Northern Nigeria. Join us to connect, learn, and showcase your work.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        {children}
      </body>
    </html>
  );
}
