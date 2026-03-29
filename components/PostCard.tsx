// components/PostCard.tsx
import Link from 'next/link'
import TopicBadge from './TopicBadge'

interface Topic {
  id: string
  name: string
  slug: string
  color: string
}

interface PostCardProps {
  post: {
    title: string
    slug: string
    excerpt: string
    publishedAt: Date | null
    readingTimeMin: number
    topics: { topic: Topic }[]
  }
}

function formatDate(date: Date | null): string {
  if (!date) return ''
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <article className="py-8 border-b border-gray-100 last:border-0 group">
      {post.topics.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {post.topics.map(({ topic }) => (
            <TopicBadge key={topic.id} topic={topic} />
          ))}
        </div>
      )}

      <Link href={`/blog/${post.slug}`}>
        <h2 className="text-xl font-semibold text-[#1A1A1A] mb-2 group-hover:text-accent transition-colors leading-snug">
          {post.title}
        </h2>
      </Link>

      <p className="text-gray-500 text-base leading-relaxed mb-4 line-clamp-2">
        {post.excerpt}
      </p>

      <div className="flex items-center gap-2 text-sm text-gray-400">
        <time dateTime={post.publishedAt?.toISOString()}>
          {formatDate(post.publishedAt)}
        </time>
        <span>·</span>
        <span>{post.readingTimeMin} min read</span>
      </div>
    </article>
  )
}
