import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/pages/**/*.{js,ts,jsx,tsx}', './src/components/**/*.{js,ts,jsx,tsx}', './src/app/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif']
      },
      colors: {
        background: '#0b0b0f',
        foreground: '#f5f5f5',
        accent: {
          DEFAULT: '#ff3b5c',
          soft: '#ff6b6b'
        },
        surface: '#14141a'
      },
      boxShadow: {
        glow: '0 0 20px rgba(255, 59, 92, 0.35)'
      },
      backgroundImage: {
        'gradient-soft': 'linear-gradient(135deg, rgba(11,11,15,0.95), rgba(34,10,25,0.95))',
        'gradient-accent': 'radial-gradient(circle at top right, rgba(255,59,92,0.35), transparent 55%)'
      },
      keyframes: {
        'gradient-x': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' }
        },
        'border-glow': {
          '0%': { filter: 'hue-rotate(0deg)' },
          '50%': { filter: 'hue-rotate(90deg)' },
          '100%': { filter: 'hue-rotate(360deg)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' }
        }
      },
      animation: {
        'gradient-x': 'gradient-x 8s ease infinite',
        'border-glow': 'border-glow 12s linear infinite',
        'slow-float': 'float 6s ease-in-out infinite'
      },
      gridTemplateColumns: {
        '15': 'repeat(15, minmax(0, 1fr))'
      }
    }
  },
  plugins: []
};

export default config;

