import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      fontFamily: {
        sans: ['Apercu', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['Apercu Mono', 'DM Mono', 'Roboto Mono', 'monospace'],
      },
      fontSize: {
        'heading-lg': '32px',
        'heading': '24px',
        'body': '16px',
        'small': '14px',
        'xs': '12px',
        'button': '16px',
      },
      colors: {
        background: {
          DEFAULT: '#FFFFFF', // Pure white background
          soft: '#FAFAFA', // Light grey alternative
        },
        text: {
          primary: '#1A1A1A', // Dark grey for primary text
          secondary: '#333333', // Slightly lighter dark grey
        },
        voicevault: {
          primary: '#A084DC',
          secondary: '#9371D9',
          accent: '#F0EBFF', // Soft purple accent
        }
      },
      boxShadow: {
        'card': '0px 4px 12px rgba(0,0,0,0.05)',
        'button': '0px 2px 6px rgba(0,0,0,0.08)',
        'subtle': '0px 1px 3px rgba(0,0,0,0.03)',
      },
      borderRadius: {
        lg: '16px',
        md: '12px',
        sm: '8px'
      },
    }
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
