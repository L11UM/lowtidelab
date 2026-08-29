/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0b1416",
        panel: "#101c1f",
        border: "rgba(255,255,255,0.08)",
        primary: {
          DEFAULT: "#5fa8a0",
          light: "#8fc9c2",
        },
        accent: {
          DEFAULT: "#d9ab72",
          light: "#e6c299",
        },
        muted: "rgba(255,255,255,0.6)",
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "monospace"],
      },
    },
  },
  plugins: [],
};
