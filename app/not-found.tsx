// app/not-found.tsx
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-24 text-center">
      <p className="text-6xl font-bold text-gray-100 mb-4">404</p>
      <h1 className="text-2xl font-semibold text-[#1A1A1A] mb-3">Page not found</h1>
      <p className="text-gray-500 mb-8">The page you're looking for doesn't exist or has been moved.</p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1A1A1A] text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
      >
        Go home
      </Link>
    </div>
  )
}
