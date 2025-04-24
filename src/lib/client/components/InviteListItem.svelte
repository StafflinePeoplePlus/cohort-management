<script lang="ts">
	import MailIcon from 'lucide-svelte/icons/mail';
	import EllipsisVerticalIcon from 'lucide-svelte/icons/ellipsis-vertical';
	import { Button, Typography, DropdownMenu, createDropdownMenu } from '@peopleplus/components';
	import { twMerge } from 'tailwind-merge';

	
	interface Props {
		class?: string | null | undefined;
		href?: string | null | undefined;
		email: string;
		actions?: import('svelte').Snippet;
	}

	let {
		class: className = undefined,
		href = undefined,
		email,
		actions
	}: Props = $props();

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
	{#if actions}
		<Button type="button" variant="secondary" icon class="h-8 w-8" use={[trigger]}>
			<EllipsisVerticalIcon aria-hidden="true" />
			<span class="sr-only">View Actions</span>
		</Button>
	{/if}
</div>

{#if actions}
	<DropdownMenu {menu}>{@render actions?.()}</DropdownMenu>
{/if}
