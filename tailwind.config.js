/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    'app.vue',
    'components/**/*.vue',
    'layouts/**/*.vue',
    'pages/**/*.vue',
  ],
  darkMode: 'class',
  plugins: [
    require('tailwindcss'),
    require('autoprefixer'),
    require('@tailwindcss/line-clamp'),
  ],
  prefix: 'tw-',
  theme: {
    colors: {
      current: 'currentColor',
      transparent: 'transparent',
      white: 'white',
      black: 'black',
    },
  },
}
