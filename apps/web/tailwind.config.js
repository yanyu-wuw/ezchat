export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#3B82F6",
        secondary: "#4F46E5",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in",
      },
    },
  },
  plugins: [],
};
