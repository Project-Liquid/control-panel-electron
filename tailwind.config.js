/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  daisyui: {
    themes: [
      {
        mytheme: {
          "primary": "#00356b",
          "secondary": "#286dc0",
          "accent": "#5f712d",
          //"neutral": "#3b283e",
          "neutral": "#002244",
          "base-100": "#f5f5f4",
          "info": "#63aaff",
          "success": "#45e3c6",
          "warning": "#f2a93a",
          "error": "#e23832",
        },
      },
    ],
  },
  plugins: [
    require('daisyui'),
  ],
}

