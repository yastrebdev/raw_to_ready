// components/Header.tsx
import Link from 'next/link'

export default function Header() {
  return (
    <header className="border-b border-gray-100 bg-white sticky top-0 z-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold text-[#1A1A1A] hover:text-accent transition-colors">
          Raw to Ready
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/blog" className="text-sm text-gray-600 hover:text-[#1A1A1A] transition-colors">
            Articles
          </Link>
          <a
            href="/api/rss"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-400 hover:text-accent transition-colors"
            title="RSS Feed"
          >
            RSS
          </a>
        </nav>
      </div>
    </header>
  )
}
