import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'JetBrains Mono', 'monospace'],
      },
      colors: {
        accent: '#2563EB',
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: '#374151',
            a: { color: '#2563EB', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } },
            'h1, h2, h3, h4': { color: '#1A1A1A', fontWeight: '600' },
            code: { backgroundColor: '#F3F4F6', padding: '0.2em 0.4em', borderRadius: '4px', fontWeight: '400' },
            'code::before': { content: '""' },
            'code::after': { content: '""' },
            pre: { backgroundColor: '#0d1117', color: '#e6edf3' },
          },
        },
      },
    },
  },
  plugins: [typography],
}

export default config
