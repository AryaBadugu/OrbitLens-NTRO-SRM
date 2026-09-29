/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        mandi: {
          50: '#f2f8f3',
          100: '#dcede0',
          200: '#b9dbc2',
          300: '#8ec49d',
          400: '#5fa676',
          500: '#3f8759',
          600: '#2f6c45',
          700: '#265639',
          800: '#20452f',
          900: '#1b3927',
        },
        earth: {
          50: '#fbf8f3',
          100: '#f2e9d8',
          500: '#c08a3e',
          700: '#8a5e26',
        },
      },
      fontFamily: {
        geist: ['Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      keyframes: {
        fadeSlideIn: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeSlideIn: 'fadeSlideIn 0.8s ease-out both',
      },
    },
  },
  plugins: [],
}
