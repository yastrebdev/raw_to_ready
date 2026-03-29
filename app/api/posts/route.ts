// app/api/posts/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAuthenticated } from '@/lib/auth'
import { calculateReadingTime } from '@/lib/reading-time'
import { slugify } from '@/lib/slugify'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') ?? ''
  const topic = searchParams.get('topic') ?? ''
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limit = Math.min(50, parseInt(searchParams.get('limit') ?? '10'))
  const publishedParam = searchParams.get('published')

  // Admin can see drafts
  const authed = await isAuthenticated()
  const publishedFilter = authed && publishedParam === 'false' ? false : true

  const where = {
    published: publishedFilter,
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
        createdAt: true,
        topics: {
          select: {
            topic: { select: { id: true, name: true, slug: true, color: true } },
          },
        },
      },
    }),
    prisma.post.count({ where }),
  ])

  return NextResponse.json({ posts, total, page, limit, pages: Math.ceil(total / limit) })
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { title, excerpt, content, coverImage, topicIds = [], published } = body

  if (!title || !excerpt || !content) {
    return NextResponse.json({ error: 'title, excerpt, content are required' }, { status: 400 })
  }

  const slug = slugify(title)
  const readingTimeMin = calculateReadingTime(content)

  // Ensure unique slug
  const existing = await prisma.post.findUnique({ where: { slug } })
  const finalSlug = existing ? `${slug}-${Date.now()}` : slug

  const post = await prisma.post.create({
    data: {
      title,
      slug: finalSlug,
      excerpt,
      content,
      coverImage: coverImage || null,
      readingTimeMin,
      published: published ?? false,
      publishedAt: published ? new Date() : null,
      topics: {
        create: topicIds.map((id: string) => ({ topicId: id })),
      },
    },
  })

  return NextResponse.json(post, { status: 201 })
}
