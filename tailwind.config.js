/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        page: '#09090b',       // Zinc-950 (True Dark Background)
        panel: '#18181b',      // Zinc-900 (Cards/Sidebar)
        input: '#27272a',      // Zinc-800 (Inputs)
        
        brand: {
          DEFAULT: '#3b82f6',  // Blue-500 (Scientific Blue)
          hover: '#2563eb',    // Blue-600
          light: '#60a5fa',    // Blue-400
          subtle: '#1e3a8a',   // Deep Blue (for subtle backgrounds)
        },
        
        txt: {
          primary: '#f4f4f5',   // Zinc-100 (High contrast text)
          secondary: '#a1a1aa', // Zinc-400 (Muted text)
          muted: '#52525b',     // Zinc-600 (Labels)
        },

        border: {
          DEFAULT: '#27272a',   // Zinc-800
          subtle: '#3f3f46',    // Zinc-700
        }
      }
    },
  },
  plugins: [],
}