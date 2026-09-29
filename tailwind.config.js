/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        apple: {
          bg: "#F5F5F7",
          card: "#FFFFFF",
          text: "#1D1D1F",
          secondary: "#86868B",
          border: "#E5E5EA",
          blue: "#0071E3",
          hoverBlue: "#0077ED",
          dark: "#121214",
          darkCard: "#1C1C1E"
        },
        jgcode: {
          50: '#F0F7FF',
          100: '#E0EFFF',
          200: '#B8DBFF',
          300: '#7AC0FF',
          400: '#38A0FF',
          500: '#0071E3',
          600: '#0058C6',
          700: '#004399',
          800: '#003170',
          900: '#00224D',
        }
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "SF Pro Text",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif"
        ],
      },
      boxShadow: {
        'apple-sm': '0 2px 8px rgba(0, 0, 0, 0.04)',
        'apple': '0 4px 20px rgba(0, 0, 0, 0.06)',
        'apple-lg': '0 12px 32px rgba(0, 0, 0, 0.08)',
        'apple-hover': '0 14px 28px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04)',
        'pin': '0 1px 20px 0 rgba(0, 0, 0, 0.08)',
      },
      borderRadius: {
        'apple-sm': '10px',
        'apple': '16px',
        'apple-lg': '22px',
        'apple-xl': '28px',
      }
    },
  },
  plugins: [],
}
