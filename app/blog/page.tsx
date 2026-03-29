// app/blog/page.tsx
import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import PostCard from '@/components/PostCard'
import SearchBar from '@/components/SearchBar'
import TopicFilter from '@/components/TopicFilter'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Articles',
  description: 'Все статьи о Data Engineering — архитектура данных, пайплайны, инструменты.',
}

export const revalidate = 60

interface PageProps {
  searchParams: Promise<{ search?: string; topic?: string; page?: string }>
}

async function getPosts(search: string, topic: string, page: number) {
  const limit = 10
  const where = {
    published: true,
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' as const } },
        { excerpt: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
    ...(topic && {
      topics: { some: { topic: { slug: topic } } },
    }),
  }

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
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
    }),
    prisma.post.count({ where }),
  ])

  return { posts, total, pages: Math.ceil(total / limit) }
}

async function getTopics() {
  return prisma.topic.findMany({ orderBy: { name: 'asc' } })
}

export default async function BlogPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const search = sp.search ?? ''
  const topic = sp.topic ?? ''
  const page = Math.max(1, parseInt(sp.page ?? '1'))

  const [{ posts, total, pages }, topics] = await Promise.all([
    getPosts(search, topic, page),
    getTopics(),
  ])

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">Articles</h1>
        <p className="text-gray-500">
          {total} {total === 1 ? 'article' : 'articles'} about Data Engineering
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-4">
        <Suspense>
          <SearchBar />
        </Suspense>
        {topics.length > 0 && (
          <Suspense>
            <TopicFilter topics={topics} />
          </Suspense>
        )}
      </div>

      {/* Posts */}
      {posts.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="mb-2">No articles found.</p>
          {(search || topic) && (
            <Link href="/blog" className="text-sm text-accent hover:underline">
              Clear filters
            </Link>
          )}
        </div>
      ) : (
        <>
          <div>
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              {page > 1 && (
                <Link
                  href={`/blog?${new URLSearchParams({ ...(search && { search }), ...(topic && { topic }), page: String(page - 1) })}`}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                >
                  ← Previous
                </Link>
              )}
              <span className="text-sm text-gray-400">
                Page {page} of {pages}
              </span>
              {page < pages && (
                <Link
                  href={`/blog?${new URLSearchParams({ ...(search && { search }), ...(topic && { topic }), page: String(page + 1) })}`}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                >
                  Next →
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
