import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        xero: {
          bg:      '#0A0C0A',
          surface: '#141614',
          border:  '#1E261E',
          accent:  '#5B8A3C',
          hover:   '#4A7230',
          muted:   '#6B7A6B',
          gray:    '#9CA89C',
        },
      },
      fontFamily: {
        display: ['Barlow Condensed', 'sans-serif'],
        body:    ['DM Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
