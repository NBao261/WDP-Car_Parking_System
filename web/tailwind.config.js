/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // ──────────────────────────────────────────────
      // COLOR SYSTEM — extracted from Figma Admin UI
      // ──────────────────────────────────────────────
      colors: {
        // Brand
        brand: {
          DEFAULT: '#060606',
          foreground: '#ffffff',
        },
        accent: {
          DEFAULT: '#d7ee46',
          dark: '#96a827',
          darker: '#7a8c17',
          foreground: '#556314',
        },

        // Surfaces
        surface: {
          DEFAULT: '#f9fafb', // gray-50
          card: '#ffffff',
          sidebar: '#eff0ef',
        },

        // Semantic
        destructive: {
          DEFAULT: '#d4183d',
          foreground: '#ffffff',
        },

        // Muted
        muted: {
          DEFAULT: '#ececf0',
          foreground: '#717182',
        },

        // Input
        'input-bg': '#f3f3f5',

        // Border
        border: 'rgba(0, 0, 0, 0.1)',

        // Chart colors (converted from oklch to hex approximations)
        chart: {
          1: '#e07830', // warm orange
          2: '#2ba89c', // teal
          3: '#4a6b8a', // steel blue
          4: '#d4b830', // gold
          5: '#c8a028', // amber
        },

        // Sidebar
        sidebar: {
          DEFAULT: '#eff0ef',
          foreground: '#060606',
          primary: '#060606',
          'primary-foreground': '#f8f8f8',
          accent: '#f5f5f5',
          'accent-foreground': '#333333',
          border: '#e5e5e5',
        },
      },

      // ──────────────────────────────────────────────
      // BORDER RADIUS — from Figma token --radius: 0.625rem
      // ──────────────────────────────────────────────
      borderRadius: {
        sm: 'calc(0.625rem - 4px)', // ~6px
        md: 'calc(0.625rem - 2px)', // ~8px
        lg: '0.625rem', // 10px
        xl: 'calc(0.625rem + 4px)', // ~14px
        '2xl': '1rem', // 16px
      },

      // ──────────────────────────────────────────────
      // FONT — system sans-serif (matches Figma)
      // ──────────────────────────────────────────────
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
      },

      // ──────────────────────────────────────────────
      // FONT WEIGHT — from Figma tokens
      // ──────────────────────────────────────────────
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },

      // ──────────────────────────────────────────────
      // ANIMATION — for micro-interactions
      // ──────────────────────────────────────────────
      transitionDuration: {
        fast: '150ms',
        normal: '200ms',
        slow: '300ms',
      },

      // ──────────────────────────────────────────────
      // KEYFRAMES & ANIMATION
      // ──────────────────────────────────────────────
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [],
};
