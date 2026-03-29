// app/api/topics/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAuthenticated } from '@/lib/auth'
import { slugify } from '@/lib/slugify'

export const dynamic = 'force-dynamic'

const COLORS = [
  '#2563EB', '#059669', '#D97706', '#7C3AED',
  '#DB2777', '#0891B2', '#65A30D', '#DC2626',
]

export async function GET() {
  const topics = await prisma.topic.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { posts: true } } },
  })
  return NextResponse.json(topics)
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { name, color } = await req.json()
  if (!name) return NextResponse.json({ error: 'name is required' }, { status: 400 })

  const slug = slugify(name)
  const finalColor = color ?? COLORS[Math.floor(Math.random() * COLORS.length)]

  const topic = await prisma.topic.upsert({
    where: { slug },
    update: {},
    create: { name: name.trim(), slug, color: finalColor },
  })

  return NextResponse.json(topic, { status: 201 })
}
