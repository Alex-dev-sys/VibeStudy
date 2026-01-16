import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/pages/**/*.{js,ts,jsx,tsx}', './src/components/**/*.{js,ts,jsx,tsx}', './src/app/**/*.{js,ts,jsx,tsx}'],
  darkMode: ['class', 'class'],
  theme: {
  	extend: {
  		fontFamily: {
  			sans: [
  				'Inter"',
  				'system-ui',
  				'sans-serif'
  			]
  		},
  		fontSize: {
  			xs: [
  				'0.75rem',
  				{
  					lineHeight: '1.5'
  				}
  			],
  			sm: [
  				'0.875rem',
  				{
  					lineHeight: '1.6'
  				}
  			],
  			base: [
  				'1rem',
  				{
  					lineHeight: '1.7'
  				}
  			],
  			lg: [
  				'1.125rem',
  				{
  					lineHeight: '1.7'
  				}
  			],
  			xl: [
  				'1.25rem',
  				{
  					lineHeight: '1.7'
  				}
  			],
  			'2xl': [
  				'1.5rem',
  				{
  					lineHeight: '1.6'
  				}
  			],
  			'3xl': [
  				'1.875rem',
  				{
  					lineHeight: '1.5'
  				}
  			],
  			'4xl': [
  				'2.25rem',
  				{
  					lineHeight: '1.4'
  				}
  			],
  			'5xl': [
  				'3rem',
  				{
  					lineHeight: '1.3'
  				}
  			],
  			'6xl': [
  				'3.75rem',
  				{
  					lineHeight: '1.2'
  				}
  			]
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				soft: 'var(--accent-soft)',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			surface: 'var(--surface)',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		spacing: {
  			touch: '44px',
  			'mobile-padding': '1.5rem',
  			'desktop-padding': '2rem',
  			section: '2rem',
  			'section-lg': '3rem',
  			'section-xl': '4rem'
  		},
  		zIndex: {
  			base: '0',
  			content: '10',
  			sticky: '20',
  			navigation: '30',
  			dropdown: '40',
  			overlay: '9998',
  			modal: '9999',
  			toast: '70',
  			tooltip: '80'
  		},
  		boxShadow: {
  			glow: '0 0 28px rgba(255, 0, 148, 0.35)'
  		},
  		backgroundImage: {
  			'gradient-soft': 'linear-gradient(135deg, rgba(10,3,18,0.92), rgba(36,7,45,0.88))',
  			'gradient-accent': 'radial-gradient(circle at top right, rgba(255,0,148,0.35), transparent 55%)'
  		},
  		keyframes: {
  			'gradient-x': {
  				'0%, 100%': {
  					backgroundPosition: '0% 50%'
  				},
  				'50%': {
  					backgroundPosition: '100% 50%'
  				}
  			},
  			'border-glow': {
  				'0%': {
  					filter: 'hue-rotate(0deg)'
  				},
  				'50%': {
  					filter: 'hue-rotate(90deg)'
  				},
  				'100%': {
  					filter: 'hue-rotate(360deg)'
  				}
  			},
  			float: {
  				'0%, 100%': {
  					transform: 'translateY(0px)'
  				},
  				'50%': {
  					transform: 'translateY(-12px)'
  				}
  			},
  			'bounce-subtle': {
  				'0%, 100%': {
  					transform: 'translateY(0)'
  				},
  				'50%': {
  					transform: 'translateY(-4px)'
  				}
  			},
  			'pulse-glow': {
  				'0%, 100%': {
  					boxShadow: '0 0 20px rgba(255, 0, 148, 0.3)'
  				},
  				'50%': {
  					boxShadow: '0 0 40px rgba(255, 0, 148, 0.6)'
  				}
  			},
  			'spin-slow': {
  				'0%': {
  					transform: 'rotate(0deg)'
  				},
  				'100%': {
  					transform: 'rotate(360deg)'
  				}
  			},
  			'scale-in': {
  				'0%': {
  					transform: 'scale(0.95)',
  					opacity: '0'
  				},
  				'100%': {
  					transform: 'scale(1)',
  					opacity: '1'
  				}
  			},
  			'slide-in-right': {
  				'0%': {
  					transform: 'translateX(100%)',
  					opacity: '0'
  				},
  				'100%': {
  					transform: 'translateX(0)',
  					opacity: '1'
  				}
  			},
  			'slide-up': {
  				'0%': {
  					transform: 'translateY(100%)',
  					opacity: '0'
  				},
  				'100%': {
  					transform: 'translateY(0)',
  					opacity: '1'
  				}
  			},
  			'fade-in': {
  				'0%': {
  					opacity: '0'
  				},
  				'100%': {
  					opacity: '1'
  				}
  			}
  		},
  		animation: {
  			'gradient-x': 'gradient-x 8s ease infinite',
  			'border-glow': 'border-glow 12s linear infinite',
  			'slow-float': 'float 6s ease-in-out infinite',
  			'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite',
  			'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
  			'spin-slow': 'spin-slow 1s linear infinite',
  			'scale-in': 'scale-in 0.2s ease-out',
  			'slide-in-right': 'slide-in-right 0.3s ease-out',
  			'slide-up': 'slide-up 0.3s ease-out',
  			'fade-in': 'fade-in 0.2s ease-out'
  		},
  		gridTemplateColumns: {
  			'15': 'repeat(15, minmax(0, 1fr))'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")]
};

export default config;

