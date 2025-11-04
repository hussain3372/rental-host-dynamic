/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Override Tailwind's modern color system for html2canvas compatibility
        white: "rgb(255,255,255)",
        black: "rgb(0,0,0)",
        gray: {
          100: "rgb(243,244,246)",
          300: "rgb(209,213,219)",
          400: "rgb(156,163,175)",
          600: "rgb(75,85,99)",
          900: "rgb(17,24,39)",
        },
        yellow: {
          400: "rgb(250,204,21)",
          500: "rgb(234,179,8)",
          600: "rgb(202,138,4)",
        },
      },
    },
  },
  plugins: [],
};

export default config;
