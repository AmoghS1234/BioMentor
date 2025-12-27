/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // --- THIS PART IS CRITICAL ---
        page: 'var(--page)', 
        panel: 'var(--panel)',
        input: 'var(--input)',
        
        brand: {
          DEFAULT: 'var(--brand)', 
          hover: 'var(--brand-hover)',
          light: 'var(--brand-light)', 
        },
        
        txt: {
          primary: 'var(--txt-primary)',
          secondary: 'var(--txt-secondary)', 
          muted: 'var(--txt-muted)',     
        },

        border: {
          DEFAULT: 'var(--border)',   
        }
        // -----------------------------
      }
    },
  },
  plugins: [],
}