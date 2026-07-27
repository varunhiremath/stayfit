/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // LUDI light health palette. Names kept for source compatibility with
        // components that use Tailwind colour classes; values mirror tokens.css.
        canvas: '#F4F6F9',
        chalk: '#FFFFFF',
        ivory: '#EEF2F7',
        stone: '#1E293B',
        obsidian: '#0F172A',
        ash: '#94A3B8',
        gold: '#10B981', // primary — emerald
        ember: '#FB7185', // energy — coral
        sage: '#0D9488', // calm teal
      },
      fontFamily: {
        display: ["'Plus Jakarta Sans'", "'DM Sans'", 'sans-serif'],
        sans: ["'DM Sans'", 'sans-serif'],
        mono: ["'DM Mono'", 'monospace'],
      },
    },
  },
  plugins: [],
};
