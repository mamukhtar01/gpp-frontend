/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'var(--font-gillsansnova)',
          'ui-sans-serif',
          'system-ui',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'Noto Sans',
          'sans-serif',
        ],
      },
      colors: {
        brand: {
          50: 'var(--brand-50, #e9eefc)',
          100: 'var(--brand-100, #cfe0fa)',
          200: 'var(--brand-200, #9dbff6)',
          300: 'var(--brand-300, #6b9ff0)',
          400: 'var(--brand-400, #3b7fe8)',
          500: 'var(--brand-500, #0033a0)',
          600: 'var(--brand-600, #002b85)',
          700: 'var(--brand-700, #002063)',
          800: 'var(--brand-800, #00143f)',
          900: 'var(--brand-900, #000920)',
        },
      }
    },
  },
  plugins: [],
};
