<script lang="ts">
	import MailIcon from 'lucide-svelte/icons/mail';
	import EllipsisVerticalIcon from 'lucide-svelte/icons/ellipsis-vertical';
	import {
		Button,
		Typography,
		DropdownMenu,
		createDropdownMenu,
		DropdownMenuItem,
		DropdownMenuDivider,
	} from '@peopleplus/components';
	import { twMerge } from 'tailwind-merge';
	import type { ComponentType } from 'svelte';

	let className: string | null | undefined = undefined;
	export { className as class };
	export let href: string | null | undefined = undefined;
	export let email: string;

	export let actions:
		| (
				| {
						type: 'link';
						href: string;
						label: string;
						icon?: ComponentType;
						variant: 'default' | 'danger' | 'primary';
				  }
				| { type: 'divider' }
				| {
						type: 'action';
						label: string;
						action: () => void;
						icon?: ComponentType;
						variant: 'default' | 'danger' | 'primary';
				  }
		  )[]
		| undefined = undefined;

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
	<DropdownMenu {menu}>
		{#each actions as action}
			{#if action.type === 'divider'}
				<DropdownMenuDivider />
			{:else if action.type === 'link'}
				<DropdownMenuItem href={action.href}>
					{#if action.icon}
						<svelte:component this={action.icon} size={16} />
					{/if}
					{action.label}
				</DropdownMenuItem>
			{:else if action.type === 'action'}
				<DropdownMenuItem on:click={action.action}>
					{#if action.icon}
						<svelte:component this={action.icon} size={16} />
					{/if}
					{action.label}
				</DropdownMenuItem>
			{/if}
		{/each}
	</DropdownMenu>
{/if}
