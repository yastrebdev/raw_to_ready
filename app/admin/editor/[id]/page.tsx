// app/admin/editor/[id]/page.tsx
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { isAuthenticated } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import PostEditor from '@/components/PostEditor'

type Params = { params: Promise<{ id: string }> }

export default async function EditPostPage({ params }: Params) {
  if (!(await isAuthenticated())) redirect('/admin/login')

  const { id } = await params
  const [post, topics] = await Promise.all([
    prisma.post.findUnique({
      where: { id },
      include: { topics: { include: { topic: true } } },
    }),
    prisma.topic.findMany({ orderBy: { name: 'asc' } }),
  ])

  if (!post) notFound()

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin" className="text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Edit post</h1>
        {post.published && (
          <Link
            href={`/blog/${post.slug}`}
            target="_blank"
            className="ml-auto text-sm text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1"
          >
            View live
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </Link>
        )}
      </div>

      <PostEditor
        postId={post.id}
        topics={topics}
        initialData={{
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          coverImage: post.coverImage ?? '',
          published: post.published,
          topicIds: post.topics.map((pt) => pt.topicId),
        }}
      />
    </div>
  )
}
