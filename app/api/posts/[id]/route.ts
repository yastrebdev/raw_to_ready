// app/api/posts/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAuthenticated } from '@/lib/auth'
import { calculateReadingTime } from '@/lib/reading-time'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params

  // Support both UUID and slug
  const post = await prisma.post.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    include: {
      topics: {
        include: { topic: true },
      },
    },
  })

  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(post)
}

export async function PUT(req: NextRequest, { params }: Params) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()
  const { title, excerpt, content, coverImage, topicIds = [], published } = body

  const existing = await prisma.post.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const readingTimeMin = content ? calculateReadingTime(content) : existing.readingTimeMin

  // Handle publish state change
  const wasPublished = existing.published
  const publishedAt = published && !wasPublished ? new Date() : existing.publishedAt

  const post = await prisma.post.update({
    where: { id },
    data: {
      ...(title && { title }),
      ...(excerpt && { excerpt }),
      ...(content && { content }),
      coverImage: coverImage ?? existing.coverImage,
      readingTimeMin,
      published: published ?? existing.published,
      publishedAt,
      topics: {
        deleteMany: {},
        create: topicIds.map((tid: string) => ({ topicId: tid })),
      },
    },
  })

  return NextResponse.json(post)
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  await prisma.post.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
