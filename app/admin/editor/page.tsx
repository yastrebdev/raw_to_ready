// app/admin/editor/page.tsx
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { isAuthenticated } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import PostEditor from '@/components/PostEditor'

export default async function NewPostPage() {
  if (!(await isAuthenticated())) redirect('/admin/login')

  const topics = await prisma.topic.findMany({ orderBy: { name: 'asc' } })

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin" className="text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">New post</h1>
      </div>

      <PostEditor topics={topics} />
    </div>
  )
}
