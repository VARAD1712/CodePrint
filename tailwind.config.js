/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cream': '#FAFAF8',
        'cream-dark': '#F2F1EE',
        'ink': '#1A1A1A',
        'ink-light': '#6B6B6B',
        'ink-faint': '#A3A3A3',
        'border-soft': '#E8E6E1',
        'sage': '#7C9A82',
        'sage-light': '#E8F0EA',
        'amber': '#D4A853',
        'amber-light': '#FDF5E6',
        'lavender': '#9B8EC4',
        'lavender-light': '#F0ECF8',
        'rose': '#C48B8B',
        'rose-light': '#F8EDED',
        'sky': '#6B9ECF',
        'sky-light': '#EBF3FA',
        // Legacy
        'warm-white': '#FAFAF8',
        'slate-gray': '#6B6B6B',
        'deep-graphite': '#1A1A1A',
        'charcoal': '#1A1A1A',
        'stone-border': '#E8E6E1',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
