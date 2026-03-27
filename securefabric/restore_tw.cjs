const fs = require('fs');

const html = fs.readFileSync('utf8_code.html', 'utf8');

// extract the colors object from html
const colorsMatch = html.match(/colors:\s*(\{[^}]+\})/);

let colorsObjStr = colorsMatch[1];
// it's pseudo json, actually JS object. We can just inject it.

const tailwindConfig = `/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: ${colorsObjStr},
      fontFamily: {
        sans: ['"Newsreader"', 'serif'],
        serif: ['"Newsreader"', 'serif'],
        display: ['"Newsreader"', 'serif'],
        body: ['"Newsreader"', 'serif'],
        headline: ['"Newsreader"', 'serif'],
        label: ['"Newsreader"', 'serif']
      },
      borderRadius: {
        DEFAULT: "1rem", 
        lg: "2rem", 
        xl: "3rem", 
        full: "9999px"
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'scan': 'scan 2s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'fadeIn': 'fadeIn 0.5s ease-out',
        'slideUp': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      }
    },
  },
  plugins: [],
}
`;

fs.writeFileSync('tailwind.config.js', tailwindConfig);
console.log('Restored tailwind.config.js');
