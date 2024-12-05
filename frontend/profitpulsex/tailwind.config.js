/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // first color in scheme - dark blue
        bgdark: "#0b1726",
        // second color in scheme - grey
        bglight: "#2e4159",
        // third color - light blue text color
        textcolor: "#c4e2f2",
        // green stock color
        lightgreen: "#20d919",
        // red stock color
        boldred: "#f24444",
      },

      fontFamily: {
        // Lora will be used for headings -- using tailwind example "text-xl font-heading"
        heading: ["Lora", "serif"],
        // Roboto will be used for body text -- using tailwind example "text-sm font-body"
        body: ["Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};
