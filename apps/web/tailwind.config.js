/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [],
  theme: {
    extend: {
      colors: {
        // primary: defaultTheme.colors.green,
      },
      fontSize: {
        "5xl": [
          "5rem",
          {
            lineHeight: "normal",
            fontWeight: "400",
          },
        ],
        "4xl": [
          "3.125rem",
          {
            lineHeight: "normal",
            fontWeight: "400",
          },
        ],
        "3xl": [
          "2.5rem",
          {
            lineHeight: "normal",
            fontWeight: "400",
          },
        ],
        "2xl": [
          "1.875rem",
          {
            lineHeight: "normal",
            fontWeight: "400",
          },
        ],
        xl: [
          "1.625rem",
          {
            lineHeight: "normal",
            fontWeight: "400",
          },
        ],
        base: [
          "1.25rem",
          {
            lineHeight: "normal",
            fontWeight: "400",
          },
        ],
        sm: [
          "1rem",
          {
            lineHeight: "23px",
            fontWeight: "400",
          },
        ],
      },
    },
    screens: {
      sm: "400px",
      // => @media (min-width: 640px) { ... }

      md: "600px",
      // => @media (min-width: 768px) { ... }

      lg: "800px",
      // => @media (min-width: 1024px) { ... }

      xl: "1200px",
      // => @media (min-width: 1280px) { ... }

      "2xl": "1920px",
      // => @media (min-width: 1536px) { ... }
    },
  },
  important: true,
};
