// app/page.tsx
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import PostCard from '@/components/PostCard'

export const dynamic = 'force-dynamic'

async function getLatestPosts() {
  return prisma.post.findMany({
    where: { published: true },
    orderBy: { publishedAt: 'desc' },
    take: 5,
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      coverImage: true,
      published: true,
      readingTimeMin: true,
      publishedAt: true,
      topics: {
        select: {
          topic: { select: { id: true, name: true, slug: true, color: true } },
        },
      },
    },
  })
}

export default async function HomePage() {
  const posts = await getLatestPosts()

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
      {/* Hero */}
      <section className="mb-20">
        <h1 className="text-4xl sm:text-5xl font-bold text-[#1A1A1A] mb-4 leading-tight tracking-tight">
          Raw to Ready
        </h1>
        <p className="text-xl text-gray-500 mb-6 leading-relaxed max-w-xl">
          Технический блог о Data Engineering — строим пайплайны, разбираем архитектуры, работаем с данными.
        </p>
        <div className="flex items-center gap-4">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1A1A1A] text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            All articles
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <a
            href="/api/rss"
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            RSS Feed
          </a>
        </div>
      </section>

      {/* Latest posts */}
      {posts.length > 0 ? (
        <section>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-8">
            Latest Articles
          </h2>
          <div>
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
          {posts.length >= 5 && (
            <div className="mt-10">
              <Link
                href="/blog"
                className="text-sm text-accent hover:underline"
              >
                View all articles →
              </Link>
            </div>
          )}
        </section>
      ) : (
        <section className="text-center py-16 text-gray-400">
          <p>No articles yet. Check back soon!</p>
        </section>
      )}
    </div>
  )
}
