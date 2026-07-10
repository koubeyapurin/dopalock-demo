/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ネイビー（サイドバー・見出し）
        navy: {
          DEFAULT: '#0f1e3d',
          900: '#0b1730',
          800: '#12213f',
          700: '#1a2b52',
          600: '#243b6b',
          100: '#dce3f1',
          50: '#eef2f9',
        },
        // ブランドブルー（CTA・アクセント）
        brand: {
          DEFAULT: '#2563eb',
          50: '#eef4ff',
          100: '#dce7ff',
          200: '#bcd0ff',
          400: '#5b8def',
          500: '#2563eb',
          600: '#1d4ed8',
          700: '#1e40af',
        },
        // アクセントグリーン（成功・休憩）
        accent: {
          DEFAULT: '#14b8a6',
          500: '#14b8a6',
          600: '#0d9488',
        },
      },
      fontFamily: {
        sans: [
          '"Noto Sans JP"',
          '"Hiragino Sans"',
          '"Hiragino Kaku Gothic ProN"',
          '"Yu Gothic"',
          'Meiryo',
          'system-ui',
          'sans-serif',
        ],
      },
      boxShadow: {
        card: '0 1px 3px rgba(15, 30, 61, 0.06), 0 8px 24px rgba(15, 30, 61, 0.06)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
