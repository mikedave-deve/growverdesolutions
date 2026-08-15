/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Unified brand palette — matches the public marketing site's
        // ink/teal/gold identity so the portal, auth pages, and
        // employee profile all read as one cohesive product.
        ink: {
          900: "#161A26",
          800: "#232840",
          700: "#2F3550",
        },
        forest: {
          // Repointed to the brand teal accent (kept the "forest" key
          // so every existing Tailwind class — bg-forest-700, etc. —
          // updates app-wide from a single source of truth).
          50: "#EAF2F0",
          100: "#D3E5E1",
          200: "#A8CBC3",
          300: "#7DB0A4",
          400: "#4F8F80",
          500: "#2F6E63",
          600: "#255A51",
          700: "#1E4941",
          800: "#173731",
          900: "#112722",
        },
        gold: {
          50: "#FBF6EC",
          100: "#F1E3CB",
          200: "#E4CC9C",
          400: "#D9A441",
          500: "#C9974B",
          600: "#AD7D37",
          700: "#8F6529",
        },
        sage: {
          400: "#7C9C8E",
          500: "#5E8172",
        },
        sand: {
          50: "#FAFAF7",
          100: "#F2F1EC",
          200: "#E4E1D9",
          300: "#CFC9BA",
        },
        signal: {
          success: "#2F6B4F",
          successBg: "#E7F1EA",
          warning: "#9A6A16",
          warningBg: "#FBF1DD",
          error: "#B23A34",
          errorBg: "#FBEAE9",
          info: "#2C5D8F",
          infoBg: "#E9F0F8",
        },
      },
      fontFamily: {
        display: ["Manrope", "ui-sans-serif", "system-ui", "sans-serif"],
        body: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(19, 26, 38, 0.06), 0 1px 8px rgba(19, 26, 38, 0.04)",
        popover: "0 8px 24px rgba(19, 26, 38, 0.14)",
      },
      borderRadius: {
        xl: "10px",
        "2xl": "14px",
      },
    },
  },
  plugins: [],
};
