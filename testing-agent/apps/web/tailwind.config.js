/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-elevated': 'var(--surface-elevated)',
        border: 'var(--border)',
        'border-hover': 'var(--border-hover)',
        text: 'var(--text)',
        muted: 'var(--text-muted)',
        primary: 'var(--primary)',
        'primary-hover': 'var(--primary-hover)',
        'primary-tint': 'var(--primary-tint)',
        success: 'var(--success)',
        'success-tint': 'var(--success-tint)',
        danger: 'var(--danger)',
        'danger-tint': 'var(--danger-tint)',
        warning: 'var(--warning)',
        'warning-tint': 'var(--warning-tint)',
        info: 'var(--info)',
        'info-tint': 'var(--info-tint)',
      },
      borderRadius: {
        input: '6px',
        card: '10px',
        modal: '14px',
        full: '999px',
      },
      boxShadow: {
        none: 'none',
      },
      animation: {
        'ai-pulse': 'ai-pulse 2000ms ease-in-out infinite',
        enter: 'enter 180ms cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        'ai-pulse': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.6', transform: 'scale(0.92)' },
        },
        enter: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

