import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AuthProvider from '@/components/AuthProvider';
import ToastProvider from '@/components/Toast';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'ToolShelf — Curated Developer Tools Directory',
    template: '%s | ToolShelf',
  },
  description:
    'Discover the best developer tools with AI-enriched quality scores, maintenance status, and compatibility data. CLI tools, MCP servers, AI coding tools, and more.',
  metadataBase: new URL('https://toolshelf.dev'),
  openGraph: {
    title: 'ToolShelf — Curated Developer Tools Directory',
    description:
      'Discover the best developer tools with AI-enriched quality scores and maintenance data.',
    siteName: 'ToolShelf',
    type: 'website',
    images: [{ url: '/og', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
  },
  alternates: {
    types: {
      'application/rss+xml': '/blog/feed.xml',
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col bg-white font-sans antialiased dark:bg-zinc-950`}
      >
        <AuthProvider>
          <ToastProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
