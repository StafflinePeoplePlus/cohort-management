import colors from 'tailwindcss/colors';
import ppSvelteComponents from 'pp-svelte-components/tailwind';

/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: 'class',
	content: [
		'./src/**/*.{html,js,svelte,ts}',
		'./node_modules/pp-svelte-components/dist/**/*.{svelte,js}',
	],
	theme: {
		extend: {
			colors: {
				primary: colors.emerald,
			},
		},
	},
	plugins: [ppSvelteComponents],
};
