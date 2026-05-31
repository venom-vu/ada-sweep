import type { Config } from 'tailwindcss'

export default <Config>{
  content: [
    './app/components/**/*.{vue,js,ts}',
    './app/layouts/**/*.vue',
    './app/pages/**/*.vue',
    './app/composables/**/*.{js,ts}',
    './app/plugins/**/*.{js,ts}',
    './app/utils/**/*.{js,ts}',
    './app/app.vue',
    './app/error.vue'
  ],
  theme: {
    extend: {
      colors: {
        fintech: {
          black: '#07080c',
          dark: '#0a0e18',
          card: 'rgba(10, 14, 24, 0.72)',
          border: 'rgba(255, 255, 255, 0.06)',
          textMuted: '#64748b',
          cyan: '#06b6d4',
          blue: '#3b82f6',
          emerald: '#10b981',
          rose: '#f43f5e',
        },
        health: {
          rose: {
            bg: 'rgba(244, 63, 94, 0.05)',
            border: 'rgba(244, 63, 94, 0.1)',
            text: '#fb7185'
          },
          amber: {
            bg: 'rgba(245, 158, 11, 0.05)',
            border: 'rgba(245, 158, 11, 0.1)',
            text: '#fbbf24'
          },
          emerald: {
            bg: 'rgba(16, 185, 129, 0.05)',
            border: 'rgba(16, 185, 129, 0.1)',
            text: '#34d399'
          }
        }
      },
      borderRadius: {
        'card': '16px',
        'btn': '12px'
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'Geist', 'Satoshi', 'sans-serif'],
        display: ['Outfit', 'Geist', 'Satoshi', 'sans-serif'],
        mono: ['Space Mono', 'JetBrains Mono', 'monospace']
      },
      boxShadow: {
        'fintech-glow': '0 4px 20px rgba(59, 130, 246, 0.05)',
        'premium': '0 8px 32px 0 rgba(0, 0, 0, 0.5)'
      },
      animation: {
        'shimmer': 'shimmer 2s infinite',
        'fade-in': 'fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' }
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        }
      }
    }
  },
  plugins: []
}
