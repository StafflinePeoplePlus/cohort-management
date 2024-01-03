import colors from 'tailwindcss/colors';
import peoplePlusComponents from '@peopleplus/components/tailwind';

/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: 'class',
	content: [
		'./src/**/*.{html,js,svelte,ts}',
		'./node_modules/@peopleplus/components/dist/**/*.{svelte,js}',
	],
	theme: {
		extend: {
			colors: {
				primary: colors.emerald,
			},
		},
	},
	plugins: [peoplePlusComponents],
};
