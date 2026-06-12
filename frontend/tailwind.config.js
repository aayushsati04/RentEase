/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50:  '#f5f7ff',
          100: '#ebf0ff',
          200: '#dbe5ff',
          300: '#bfceff',
          400: '#94abff',
          500: '#637eff',
          600: '#4f62f1',
          700: '#3c4ce5',
          800: '#313ebc',
          900: '#2c3697',
          950: '#1c215e',
        },
        violet: {
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
        },
        slate: {
          50:  '#0f172a',  // Inverted to act as dark text color
          100: '#1e293b',  // Inverted to act as dark text color
          200: '#334155',  // Inverted to act as dark text color
          300: '#475569',  // Inverted to act as medium text color
          400: '#64748b',  // Inverted to act as muted text color
          500: '#94a3b8',  // Middle color
          600: '#cbd5e1',  // Light border color
          700: '#cbd5e1',  // Light border color
          800: '#f1f5f9',  // Light off-white
          850: '#f8fafc',  // Warm off-white
          900: '#f8fafc',  // Warm white background
          950: '#fafafa',  // Warm white body background
        },
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)',
        'card-gradient': 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
        'brand-gradient': 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
        'dark-gradient': 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
      },
      boxShadow: {
        'glass': '0 4px 20px rgba(15,23,42,0.04)',
        'card-hover': '0 10px 30px rgba(15,23,42,0.06)',
        'glow': '0 0 10px rgba(37,99,235,0.12)',
        'glow-sm': '0 0 5px rgba(37,99,235,0.08)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'spin-slow': 'spin 8s linear infinite',
        'counter': 'counter 2s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
}
