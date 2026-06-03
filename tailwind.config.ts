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
          purple: '#8b5cf6',
          purpleLight: '#a78bfa',
          gold: '#f59e0b',
          goldLight: '#fbbf24',
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
        heading: ['Orbitron', 'Outfit', 'sans-serif'],
        mono: ['Space Mono', 'JetBrains Mono', 'monospace']
      },
      boxShadow: {
        'fintech-glow': '0 4px 20px rgba(59, 130, 246, 0.05)',
        'fintech-glow-lg': '0 6px 30px rgba(6, 182, 212, 0.1)',
        'premium': '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
        'premium-lg': '0 16px 48px 0 rgba(0, 0, 0, 0.6)',
        'glow-purple': '0 0 20px rgba(139, 92, 246, 0.15)',
        'glow-gold': '0 0 20px rgba(245, 158, 11, 0.15)',
        'glow-cyan': '0 0 20px rgba(6, 182, 212, 0.15)'
      },
      animation: {
        'shimmer': 'shimmer 2s infinite',
        'fade-in': 'fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'float': 'float 6s ease-in-out infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'drift': 'drift 8s ease-in-out infinite'
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' }
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' }
        },
        drift: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '25%': { transform: 'translate(10px, -10px)' },
          '50%': { transform: 'translate(-5px, 5px)' },
          '75%': { transform: 'translate(-10px, -5px)' }
        }
      }
    }
  },
  plugins: []
}
