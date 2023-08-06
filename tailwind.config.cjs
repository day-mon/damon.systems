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
            sm: "640px",
            md: "768px",
            lg: "1024px",
        },
        extend: {}
    },
    plugins: []
};
