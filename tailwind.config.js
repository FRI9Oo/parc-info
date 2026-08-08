import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['EB Garamond', ...defaultTheme.fontFamily.serif],
                heading: ['EB Garamond', ...defaultTheme.fontFamily.serif],
                serif: ['EB Garamond', ...defaultTheme.fontFamily.serif],
                garamond: ['EB Garamond', ...defaultTheme.fontFamily.serif],
            },
        },
    },

    plugins: [forms],
};
