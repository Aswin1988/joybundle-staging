/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}', './lib/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#2e2925',
        cream: '#fffaf3',
        peach: '#f7a98b',
        butter: '#f7d774',
        mint: '#b8dfca',
        berry: '#c95f73',
      },
      fontFamily: { sans: ['var(--font-body)', 'Arial', 'sans-serif'] },
    },
  },
  plugins: [],
};
