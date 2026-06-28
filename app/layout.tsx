import type { Metadata } from 'next';
import { Hanken_Grotesk, Noto_Sans_SC, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const hanken = Hanken_Grotesk({
  subsets: ['latin'],
  variable: '--font-hanken',
  display: 'swap',
});
const notoSansSC = Noto_Sans_SC({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-noto-sc',
  display: 'swap',
});
const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SG AI Oasis — Singapore AI Events',
  description: 'The definitive radar for AI events in Singapore. Curated, real-time, with MRT directions.',
  openGraph: {
    title: 'SG AI Oasis',
    description: 'Curated AI events in Singapore — next 2 weeks',
    siteName: 'SG AI Oasis',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="zh-SG"
      className={`${hanken.variable} ${notoSansSC.variable} ${jetbrains.variable}`}
    >
      <body className="antialiased">{children}</body>
    </html>
  );
}
