// app/blog/[slug]/page.tsx
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import MarkdownRenderer from '@/components/MarkdownRenderer'
import TopicBadge from '@/components/TopicBadge'
import TableOfContents from '@/components/TableOfContents'

export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ slug: string }> }

async function getPost(slug: string) {
  return prisma.post.findFirst({
    where: { slug, published: true },
    include: {
      topics: { include: { topic: true } },
    },
  })
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return {}

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://rawtoready.com'

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      url: `${siteUrl}/blog/${slug}`,
      publishedTime: post.publishedAt?.toISOString(),
      ...(post.coverImage && { images: [post.coverImage] }),
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
    },
  }
}

function formatDate(date: Date | null): string {
  if (!date) return ''
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

export default async function PostPage({ params }: Params) {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) notFound()

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://rawtoready.com'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    url: `${siteUrl}/blog/${slug}`,
    ...(post.coverImage && { image: post.coverImage }),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <TableOfContents content={post.content} />

      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-10"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          All articles
        </Link>

        {/* Topics */}
        {post.topics.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {post.topics.map(({ topic }) => (
              <Link key={topic.id} href={`/blog?topic=${topic.slug}`}>
                <TopicBadge topic={topic} clickable />
              </Link>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] leading-tight mb-4">
          {post.title}
        </h1>

        {/* Meta */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-8 pb-8 border-b border-gray-100">
          <time dateTime={post.publishedAt?.toISOString()}>
            {formatDate(post.publishedAt)}
          </time>
          <span>·</span>
          <span>{post.readingTimeMin} min read</span>
        </div>

        {/* Cover image */}
        {post.coverImage && (
          <div className="relative w-full h-64 sm:h-80 mb-10 rounded-xl overflow-hidden">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Content */}
        <MarkdownRenderer content={post.content} />
      </article>
    </>
  )
}
