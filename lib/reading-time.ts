// lib/reading-time.ts

/**
 * Removes markdown syntax and counts words.
 * Formula: ceil(wordCount / 200)
 */
export function calculateReadingTime(markdown: string): number {
  // Remove code blocks
  let text = markdown.replace(/```[\s\S]*?```/g, '')
  // Remove inline code
  text = text.replace(/`[^`]*`/g, '')
  // Remove images
  text = text.replace(/!\[.*?\]\(.*?\)/g, '')
  // Remove links (keep text)
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
  // Remove markdown symbols
  text = text.replace(/[#*_~>|[\]()]/g, ' ')
  // Remove extra whitespace
  text = text.replace(/\s+/g, ' ').trim()

  const wordCount = text ? text.split(' ').length : 0
  return Math.max(1, Math.ceil(wordCount / 200))
}

export function formatReadingTime(minutes: number): string {
  return `${minutes} min read`
}
