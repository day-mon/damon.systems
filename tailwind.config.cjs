/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
    theme: {
        fontFamily: {
            dyslexic: ["OpenDyslexic", "sans-serif"],
            poppins: ['Poppins', 'sans-serif'],
            jetbrains: ['JetBrains Mono', 'monospace'],
            karla: ['Karla', 'sans-serif'],
            ysaoffice: ['Ysabeau Office', 'sans-serif'],
        },
        screens: {
            'sm': '600px',
            'md': '1024px',
            'lg': '1440px',
        },
        extend: {}
    },
    plugins: []
};
