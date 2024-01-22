<script lang="ts">
	import MailIcon from 'lucide-svelte/icons/mail';
	import MoreHorizontalIcon from 'lucide-svelte/icons/more-horizontal';
	import { Button, Typography, DropdownMenu, createDropdownMenu } from '@peopleplus/components';
	import { twMerge } from 'tailwind-merge';

	let className: string | null | undefined = undefined;
	export { className as class };
	export let href: string | null | undefined = undefined;
	export let email: string;

	const { trigger, menu } = createDropdownMenu();
</script>

<div
	class={twMerge(
		'flex items-center border-b p-4 gap-4 transition first:border-t hover:bg-gray-100',
		className,
	)}
>
	<MailIcon size={20} />
	<svelte:element this={href ? 'a' : 'div'} {href} class="mr-auto">
		<Typography variant="body" class="font-medium">{email}</Typography>
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
