/** Design tokens — sistema visual */
export default {
  theme: {
    extend: {
      colors: {
        green: {
          900: "#0B3D2C",
          700: "#0B6E4F",
          600: "#128A61",
          100: "#E6F4EC",
        },
        amber: {
          500: "#FFC857",
          600: "#F0AE2E",
        },
        ink: {
          900: "#10241D",
          600: "#4B5B54",
          400: "#8A968F",
        },
        bg: "#F6F8F6",
        surface: "#FFFFFF",
        border: "#DEE7E1",
        danger: "#C4432B",
      },
      fontFamily: {
        display: ["Sora", "sans-serif"], // títulos e números de destaque
        sans: ["Inter", "sans-serif"], // fonte predominante (corpo, UI)
        mono: ["Manrope", "sans-serif"], // labels técnicas, valores tabulares
      },
      borderRadius: {
        sm: "8px",
        md: "14px",
        lg: "22px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,36,29,.04), 0 8px 24px -12px rgba(16,36,29,.12)",
      },
      spacing: {
        18: "72px",
      },
    },
  },
};
