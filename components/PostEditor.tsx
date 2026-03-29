// components/PostEditor.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

interface Topic {
  id: string
  name: string
  slug: string
  color: string
}

interface Props {
  postId?: string
  initialData?: {
    title: string
    excerpt: string
    content: string
    coverImage: string
    published: boolean
    topicIds: string[]
  }
  topics: Topic[]
}

export default function PostEditor({ postId, initialData, topics }: Props) {
  const router = useRouter()
  const [title, setTitle] = useState(initialData?.title ?? '')
  const [excerpt, setExcerpt] = useState(initialData?.excerpt ?? '')
  const [content, setContent] = useState(initialData?.content ?? '')
  const [coverImage, setCoverImage] = useState(initialData?.coverImage ?? '')
  const [selectedTopics, setSelectedTopics] = useState<string[]>(initialData?.topicIds ?? [])
  const [newTopic, setNewTopic] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const toggleTopic = (id: string) => {
    setSelectedTopics((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    )
  }

  const save = async (publish: boolean) => {
    if (!title.trim()) { setError('Title is required'); return }
    if (!excerpt.trim()) { setError('Excerpt is required'); return }
    if (!content.trim()) { setError('Content is required'); return }

    setSaving(true)
    setError('')

    try {
      const body = { title, excerpt, content, coverImage, topicIds: selectedTopics, published: publish }
      const url = postId ? `/api/posts/${postId}` : '/api/posts'
      const method = postId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) throw new Error(await res.text())
      router.push('/admin')
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Title *</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Article title..."
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-lg font-medium focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
        />
      </div>

      {/* Excerpt */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Excerpt *</label>
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Brief description for cards and SEO..."
          rows={2}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent resize-none"
        />
      </div>

      {/* Topics */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Topics</label>
        <div className="flex flex-wrap gap-2 mb-3">
          {topics.map((t) => (
            <button
              key={t.id}
              onClick={() => toggleTopic(t.id)}
              style={{
                backgroundColor: selectedTopics.includes(t.id) ? t.color : `${t.color}18`,
                color: selectedTopics.includes(t.id) ? '#fff' : t.color,
                borderColor: `${t.color}40`,
              }}
              className="px-3 py-1 rounded-full text-xs font-medium border transition-all"
            >
              {t.name}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
            placeholder="New topic name..."
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            onKeyDown={async (e) => {
              if (e.key === 'Enter' && newTopic.trim()) {
                const res = await fetch('/api/topics', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ name: newTopic.trim() }),
                })
                if (res.ok) {
                  setNewTopic('')
                  router.refresh()
                }
              }
            }}
          />
          <span className="text-xs text-gray-400 self-center">Press Enter to create</span>
        </div>
      </div>

      {/* Cover image */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Cover image URL (optional)</label>
        <input
          value={coverImage}
          onChange={(e) => setCoverImage(e.target.value)}
          placeholder="https://..."
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
        />
      </div>

      {/* Markdown editor */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Content (Markdown) *</label>
        <div data-color-mode="light">
          <MDEditor
            value={content}
            onChange={(val) => setContent(val ?? '')}
            height={500}
            preview="live"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
        <button
          onClick={() => save(false)}
          disabled={saving}
          className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save draft'}
        </button>
        <button
          onClick={() => save(true)}
          disabled={saving}
          className="px-5 py-2.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {saving ? 'Publishing...' : 'Publish'}
        </button>
        <button
          onClick={() => router.push('/admin')}
          className="ml-auto text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
