<script lang="ts">
	import EllipsisVerticalIcon from 'lucide-svelte/icons/ellipsis-vertical';
	import {
		Avatar,
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
	export let name: string;
	export let email: string;
	export let avatar: string | null | undefined = undefined;

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
