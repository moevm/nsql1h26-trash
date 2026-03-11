/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#13ec13",
                "primary-dark": "#0fb80f",
                "text-main": "#111811",
                "text-secondary": "#618961",
            },
        },
    },
    plugins: [],
}