// lib/rss.ts
import { prisma } from './prisma'

export async function generateRSS(): Promise<string> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://rawtoready.com'
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? 'Raw to Ready'

  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { publishedAt: 'desc' },
    take: 20,
    select: {
      title: true,
      slug: true,
      excerpt: true,
      publishedAt: true,
    },
  })

  const items = posts
    .map(
      (post) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${siteUrl}/blog/${post.slug}</link>
      <guid isPermaLink="true">${siteUrl}/blog/${post.slug}</guid>
      <description><![CDATA[${post.excerpt}]]></description>
      <pubDate>${post.publishedAt?.toUTCString() ?? new Date().toUTCString()}</pubDate>
    </item>`
    )
    .join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${siteName}</title>
    <link>${siteUrl}</link>
    <description>Технический блог о Data Engineering: пайплайны, архитектура, инструменты.</description>
    <language>ru</language>
    <atom:link href="${siteUrl}/api/rss" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`
}
