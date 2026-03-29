// components/TopicFilter.tsx
'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import TopicBadge from './TopicBadge'

interface Topic {
  id: string
  name: string
  slug: string
  color: string
}

interface Props {
  topics: Topic[]
}

export default function TopicFilter({ topics }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const active = searchParams.get('topic') ?? ''

  const toggle = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (active === slug) {
      params.delete('topic')
    } else {
      params.set('topic', slug)
    }
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-2">
      {topics.map((topic) => (
        <TopicBadge
          key={topic.id}
          topic={topic}
          clickable
          active={active === topic.slug}
          onClick={() => toggle(topic.slug)}
        />
      ))}
    </div>
  )
}
