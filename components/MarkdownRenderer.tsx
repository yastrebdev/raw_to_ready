// components/MarkdownRenderer.tsx
'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Props {
  content: string
}

export default function MarkdownRenderer({ content }: Props) {
  return (
    <div className="prose prose-lg max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Code blocks with syntax highlighting via CSS
          code({ className, children, ...props }) {
            const isBlock = className?.includes('language-')
            if (isBlock) {
              const language = className?.replace('language-', '') ?? ''
              return (
                <div className="relative my-6">
                  {language && (
                    <div className="absolute top-3 right-3 text-xs text-gray-500 font-mono uppercase tracking-wider">
                      {language}
                    </div>
                  )}
                  <pre className="bg-[#0d1117] text-[#e6edf3] p-5 rounded-lg overflow-x-auto text-sm leading-relaxed">
                    <code>{children}</code>
                  </pre>
                </div>
              )
            }
            return (
              <code className="bg-gray-100 text-[#1A1A1A] px-1.5 py-0.5 rounded text-[0.875em] font-mono" {...props}>
                {children}
              </code>
            )
          },
          // Tables
          table({ children }) {
            return (
              <div className="overflow-x-auto my-6">
                <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                  {children}
                </table>
              </div>
            )
          },
          th({ children }) {
            return (
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 bg-gray-50">
                {children}
              </th>
            )
          },
          td({ children }) {
            return (
              <td className="px-4 py-3 text-sm text-gray-600 border-t border-gray-100">
                {children}
              </td>
            )
          },
          // Blockquote
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-accent pl-4 my-6 text-gray-600 italic">
                {children}
              </blockquote>
            )
          },
          // Headings
          h1({ children }) {
            return <h1 className="text-3xl font-bold text-[#1A1A1A] mt-10 mb-4">{children}</h1>
          },
          h2({ children }) {
            return <h2 className="text-2xl font-semibold text-[#1A1A1A] mt-8 mb-3">{children}</h2>
          },
          h3({ children }) {
            return <h3 className="text-xl font-semibold text-[#1A1A1A] mt-6 mb-2">{children}</h3>
          },
          // Links
          a({ href, children }) {
            const isExternal = href?.startsWith('http')
            return (
              <a
                href={href}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                className="text-accent hover:underline"
              >
                {children}
              </a>
            )
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
