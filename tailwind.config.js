/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        nabat: {
          primary: '#1F3D2B',
          hover: '#163024',
          accent: '#5B8A6A',
          mist: '#EAF3EC',
          surface: '#FFFFFF',
          muted: '#5A6B60',
          text: '#14201A',
          border: '#D5E0D8',
          soft: '#F4F7F4',
        },
      },
      fontFamily: {
        heading: ['Montserrat', 'sans-serif'],
        body: ['Montserrat', 'sans-serif'],
        nav: ['Montserrat', 'sans-serif'],
      },
      fontSize: {
        hero: ['clamp(3.5rem, 10vw, 7rem)', { lineHeight: '0.95', letterSpacing: '-0.02em' }],
      },
    },
  },
  plugins: [],
};
