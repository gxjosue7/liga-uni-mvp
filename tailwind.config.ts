import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: 'var(--paper)',
        surface: 'var(--surface)',
        ink: { DEFAULT: 'var(--ink)', soft: 'var(--ink-soft)', muted: 'var(--ink-muted)' },
        line: { DEFAULT: 'var(--line)', strong: 'var(--line-strong)' },
        brand: { DEFAULT: 'var(--brand)', deep: 'var(--brand-deep)', soft: 'var(--brand-soft)' },
        event: { DEFAULT: 'var(--event)', soft: 'var(--event-soft)' },
        ok: { DEFAULT: 'var(--ok)', soft: 'var(--ok-soft)' },
        danger: { DEFAULT: 'var(--danger)', deep: 'var(--danger-deep)', soft: 'var(--danger-soft)' },
      },
      fontFamily: {
        sans: ['var(--font-archivo)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '2px',
        md: '3px',
        lg: '4px',
      },
      boxShadow: {
        dialog: '0 24px 48px -12px rgb(18 19 21 / 0.35)',
      },
      keyframes: {
        rise: {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        rise: 'rise 180ms ease-out both',
      },
    },
  },
  plugins: [],
}

export default config
