<script lang="ts">
	import { MoreHorizontalIcon } from 'lucide-svelte';
	import { Avatar, Button, Typography } from 'pp-svelte-components';
	import { twMerge } from 'tailwind-merge';

	let className: string | undefined = undefined;
	export { className as class };
	export let href: string;
	export let name: string;
	export let email: string;
	export let avatar: string | undefined = undefined;
</script>

<div
	class={twMerge(
		'flex items-center justify-between border-b p-4 transition first:border-t hover:bg-gray-100',
		className
	)}
>
	<a {href} class="flex items-center gap-4">
		<Avatar {name} src={avatar} />
		<div>
			<Typography variant="body">{name}</Typography>
			<Typography variant="caption">{email}</Typography>
		</div>
	</a>
	<Button variant="secondary" icon class="h-8 w-8">
		<MoreHorizontalIcon />
	</Button>
</div>
