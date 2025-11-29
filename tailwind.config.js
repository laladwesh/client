/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Primary BDOGrotesk family (use font-weight utilities to pick weight)
        bdogrotesk: ['Bdogrotesk', 'system-ui', 'sans-serif'],

        // Helpful semantic aliases in case you want explicit classes per perceived weight
        // (these still use the same @font-face family — just different class names)
        'bdogrotesk-light': ['Bdogrotesk', 'system-ui', 'sans-serif'],
        'bdogrotesk-regular': ['Bdogrotesk', 'system-ui', 'sans-serif'],
        'bdogrotesk-medium': ['Bdogrotesk', 'system-ui', 'sans-serif'],
        'bdogrotesk-semibold': ['Bdogrotesk', 'system-ui', 'sans-serif'],
        'bdogrotesk-bold': ['Bdogrotesk', 'system-ui', 'sans-serif'],
        'bdogrotesk-extrabold': ['Bdogrotesk', 'system-ui', 'sans-serif'],
        'bdogrotesk-black': ['Bdogrotesk', 'system-ui', 'sans-serif'],

        // Intertight — declared as a variable-weight font in your CSS (100–900).
        // Use Tailwind's font-weight utilities (font-thin ... font-black) to pick weights.
        intertight: ['"Intertight Wght"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
