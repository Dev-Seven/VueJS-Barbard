/* eslint-disable no-undef */
/** @type {import('tailwindcss').Config} */
module.exports = {
  prefix: 'tw-',
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    container: {
      center: true
    },
    extend: {
      colors: {
        primary: '#007bff',
        secondary: '#343a40',
        warning: '#edc126',
        success: '#28a745'
      }
    }
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        barbaard: {
          primary: '#007bff',
          secondary: '#343a40',
          accent: '#37CDBE',
          neutral: '#3D4451',
          info: '#3ABFF8',
          success: '#36D399',
          warning: '#edc126',
          error: '#dc3545',
          'base-content': '#111318'
        }
      }
    ]
  }
}
