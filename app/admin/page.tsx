// app/admin/page.tsx
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { isAuthenticated } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AdminPostActions from './AdminPostActions'

async function getPosts() {
  return prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      slug: true,
      published: true,
      readingTimeMin: true,
      publishedAt: true,
      createdAt: true,
      topics: { include: { topic: true } },
    },
  })
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
}

export default async function AdminPage() {
  if (!(await isAuthenticated())) redirect('/admin/login')

  const posts = await getPosts()

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Posts</h1>
          <p className="text-gray-500 text-sm mt-1">{posts.length} total</p>
        </div>
        <Link
          href="/admin/editor"
          className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New post
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="mb-4">No posts yet.</p>
          <Link href="/admin/editor" className="text-accent hover:underline text-sm">
            Create your first post →
          </Link>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Date</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3.5">
                    <Link
                      href={`/admin/editor/${post.id}`}
                      className="font-medium text-[#1A1A1A] hover:text-accent transition-colors text-sm leading-snug"
                    >
                      {post.title}
                    </Link>
                    {post.topics.length > 0 && (
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {post.topics.map(({ topic }) => (
                          <span
                            key={topic.id}
                            className="text-xs px-1.5 py-0.5 rounded"
                            style={{ backgroundColor: `${topic.color}18`, color: topic.color }}
                          >
                            {topic.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3.5 hidden sm:table-cell">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      post.published
                        ? 'bg-green-50 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {post.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-400 hidden md:table-cell">
                    {formatDate(post.publishedAt ?? post.createdAt)}
                  </td>
                  <td className="px-4 py-3.5">
                    <AdminPostActions postId={post.id} slug={post.slug} published={post.published} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Logout */}
      <div className="mt-8 text-right">
        <form action={async () => {
          'use server'
          const { clearAuthCookie } = await import('@/lib/auth')
          await clearAuthCookie()
          redirect('/admin/login')
        }}>
          <button type="submit" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            Sign out
          </button>
        </form>
      </div>
    </div>
  )
}
