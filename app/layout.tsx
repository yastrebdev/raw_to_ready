// app/layout.tsx
import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import Header from '@/components/Header'
import './globals.css'

const geistSans = Inter({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = JetBrains_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://rawtoready.com'
const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? 'Raw to Ready'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `${siteName} — Data Engineering Blog`, template: `%s | ${siteName}` },
  description: 'Технический блог о Data Engineering: пайплайны, архитектура данных, Airflow, dbt, Spark и всё что между ними.',
  openGraph: {
    siteName,
    locale: 'ru_RU',
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="bg-white text-[#374151] antialiased">
        <Header />
        <main>{children}</main>
      </body>
    </html>
  )
}
