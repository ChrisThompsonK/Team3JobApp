/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,ts,jsx,tsx}', './views/**/*.{njk,html}'],
  theme: {
    extend: {
      colors: {
        kainos: {
          primary: '#2B4C7E', // Kainos navy blue - primary brand color
          secondary: '#1E3A5F', // Darker navy blue
          accent: '#7CB342', // Kainos green (from logo)
          dark: '#152238', // Very dark navy
          light: '#E8F0FF', // Very light blue background
          green: '#7CB342', // Official Kainos green
          'green-light': '#A5D66A', // Lighter green
          'green-dark': '#5A8C30', // Darker green
        },
      },
      fontFamily: {
        kainos: [
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};
