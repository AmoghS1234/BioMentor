import { Moon, Sun, Leaf, Droplets, Zap, Layout } from 'lucide-react';

export const THEMES = {
  // 1. DEFAULT (You liked this - Zinc & Blue)
  default: {
    name: 'BioMentor Default',
    icon: Layout,
    colors: {
      page: '#09090b',       // Zinc-950 (Hard Dark)
      panel: '#18181b',      // Zinc-900
      input: '#27272a',      // Zinc-800
      border: '#27272a',     // Zinc-800
      
      'txt-primary': '#f4f4f5',
      'txt-secondary': '#a1a1aa',
      'txt-muted': '#52525b',
      
      brand: '#3b82f6',      // Blue-500
      'brand-hover': '#2563eb',
      'brand-light': '#60a5fa',
    }
  },

  // 2. CLINICAL (You liked this - White & Sky)
  clinical: {
    name: 'Clinical Light',
    icon: Sun,
    colors: {
      page: '#f8fafc',       // Slate-50
      panel: '#ffffff',      // White
      input: '#f1f5f9',      // Slate-100
      border: '#e2e8f0',     // Slate-200
      
      'txt-primary': '#0f172a',
      'txt-secondary': '#64748b',
      'txt-muted': '#94a3b8',
      
      brand: '#0ea5e9',      // Sky-500
      'brand-hover': '#0284c7',
      'brand-light': '#38bdf8',
    }
  },

  // 3. TOXIN (Replaces Forest - Dark Grey & Acid Green)
  // Looks like a hacker terminal or biology lab. Very clean.
  toxin: {
    name: 'Bio Lab',
    icon: Leaf,
    colors: {
      page: '#0c0a09',       // Stone-950 (Warmer Black)
      panel: '#1c1917',      // Stone-900
      input: '#292524',      // Stone-800
      border: '#292524',
      
      'txt-primary': '#f5f5f4',
      'txt-secondary': '#a8a29e',
      'txt-muted': '#57534e',
      
      brand: '#10b981',      // Emerald-500 (Clean Green)
      'brand-hover': '#059669',
      'brand-light': '#34d399',
    }
  },

  // 4. OBSIDIAN (Replaces Midnight - True Black & Violet)
  // High contrast "OLED" style. Very sharp.
  obsidian: {
    name: 'Obsidian',
    icon: Moon,
    colors: {
      page: '#000000',       // Pure Black
      panel: '#111111',      // Almost Black
      input: '#222222',      // Dark Gray
      border: '#333333',
      
      'txt-primary': '#ffffff',
      'txt-secondary': '#888888',
      'txt-muted': '#555555',
      
      brand: '#8b5cf6',      // Violet-500
      'brand-hover': '#7c3aed',
      'brand-light': '#a78bfa',
    }
  },

  // 5. OCEANIC (Replaces Nebula - Deep Navy & Cyan)
  // Deep underwater feel, but still professional dark mode.
  oceanic: {
    name: 'Deep Sea',
    icon: Droplets,
    colors: {
      page: '#0b1120',       // Deep Navy
      panel: '#1e293b',      // Slate-800
      input: '#334155',      // Slate-700
      border: '#334155',
      
      'txt-primary': '#f8fafc',
      'txt-secondary': '#94a3b8',
      'txt-muted': '#64748b',
      
      brand: '#06b6d4',      // Cyan-500
      'brand-hover': '#0891b2',
      'brand-light': '#22d3ee',
    }
  }
};