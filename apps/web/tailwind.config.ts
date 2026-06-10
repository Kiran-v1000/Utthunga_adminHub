import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

const config: Config = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Fixed brand palette
        primary: {
          DEFAULT: '#7C3AED',
          50:  '#F5F0FF',
          100: '#EDE5FF',
          200: '#D5C4FF',
          300: '#B89EFF',
          400: '#9570FF',
          500: '#7C3AED',
          600: '#5B21B6',
          700: '#4C1D95',
          800: '#3B1672',
          900: '#2D1054',
        },
        secondary: '#7C3AED',
        accent:   '#0EA5E9',
        success:  '#059669',
        warning:  '#D97706',
        danger:   '#DC2626',

        // Theme-adaptive (flips with .dark via CSS vars)
        surface:  'rgb(var(--surface) / <alpha-value>)',
        card:     'rgb(var(--card)    / <alpha-value>)',
        border:   'rgb(var(--border)  / <alpha-value>)',
        'text-1': 'rgb(var(--text-1)  / <alpha-value>)',
        'text-2': 'rgb(var(--text-2)  / <alpha-value>)',
        sidebar:  'rgb(var(--sidebar) / <alpha-value>)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontSize: {
        display: ['32px', { fontWeight: '700', lineHeight: '1.2' }],
        heading: ['22px', { fontWeight: '600', lineHeight: '1.3' }],
        subhead: ['16px', { fontWeight: '500', lineHeight: '1.4' }],
        body:    ['14px', { fontWeight: '400', lineHeight: '1.5' }],
        caption: ['12px', { fontWeight: '400', lineHeight: '1.4' }],
      },
      boxShadow: {
        card:  '0 1px 3px 0 rgba(15,14,26,0.08), 0 1px 2px -1px rgba(15,14,26,0.06)',
        modal: '0 20px 60px -10px rgba(91,33,182,0.22)',
        glow:  '0 0 20px rgba(124,58,237,0.35)',
        'glow-sm': '0 0 10px rgba(124,58,237,0.25)',
      },
      backgroundImage: {
        'sidebar-gradient': 'linear-gradient(180deg, #0f0d1e 0%, #160f2e 50%, #0f0d1e 100%)',
        'card-gradient':    'linear-gradient(135deg, rgba(124,58,237,0.06) 0%, rgba(14,165,233,0.04) 100%)',
        'premium-gradient': 'linear-gradient(135deg, #7C3AED 0%, #0EA5E9 100%)',
        'amber-gradient':   'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)',
        'green-gradient':   'linear-gradient(135deg, #059669 0%, #10B981 100%)',
        'red-gradient':     'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)',
        'blue-gradient':    'linear-gradient(135deg, #0EA5E9 0%, #38BDF8 100%)',
      },
      keyframes: {
        'slide-in-right': {
          from: { transform: 'translateX(100%)' },
          to:   { transform: 'translateX(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'sidebar-collapse': {
          from: { width: '16rem' },
          to:   { width: '4rem' },
        },
      },
      animation: {
        'slide-in-right': 'slide-in-right 0.25s ease-out',
        'fade-in':        'fade-in 0.2s ease-out',
      },
    },
  },
  plugins: [animate],
};

export default config;
