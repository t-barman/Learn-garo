/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        garo: {
          50: '#f7fafc',
          100: '#edf2f7',
          200: '#e2e8f0',
          500: '#4a5568',
          600: '#2d3748',
          700: '#1a202c',
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
