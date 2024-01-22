<script lang="ts">
	import MoreHorizontalIcon from 'lucide-svelte/icons/more-horizontal';
	import {
		Avatar,
		Button,
		Typography,
		DropdownMenu,
		createDropdownMenu,
	} from '@peopleplus/components';
	import { twMerge } from 'tailwind-merge';

	let className: string | null | undefined = undefined;
	export { className as class };
	export let href: string | null | undefined = undefined;
	export let name: string;
	export let email: string;
	export let avatar: string | null | undefined = undefined;

	const { trigger, menu } = createDropdownMenu();
</script>

<div
	class={twMerge(
		'flex items-center justify-between border-b p-4 transition first:border-t hover:bg-gray-100',
		className,
	)}
>
	<svelte:element this={href ? 'a' : 'div'} {href} class="flex items-center gap-4">
		<Avatar {name} src={avatar ?? undefined} />
		<div>
			<Typography variant="body">{name}</Typography>
			<Typography variant="caption">{email}</Typography>
		</div>
	</svelte:element>
	{#if $$slots.actions}
		<Button type="button" variant="secondary" icon class="h-8 w-8" use={[trigger]}>
			<MoreHorizontalIcon aria-hidden="true" />
			<span class="sr-only">View Actions</span>
		</Button>
	{/if}
</div>

{#if $$slots.actions}
	<DropdownMenu {menu}><slot name="actions" /></DropdownMenu>
{/if}
