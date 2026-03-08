/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        /* Mobile first: sm=640, md=768, lg=1024, xl=1280, 2xl=1536 */
        'ipad-mini': '768px',   /* iPad Mini portrait */
        'ipad': '810px',        /* iPad 10.2" */
        'ipad-pro': '834px',    /* iPad Pro 11" */
        'ipad-lg': '1024px',    /* iPad Pro 12.9" / small desktop */
        'desktop': '1280px',
      },
      fontFamily: {
        'sf': ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
