<script lang="ts">
	import EllipsisVerticalIcon from 'lucide-svelte/icons/ellipsis-vertical';
	import {
		Avatar,
		Button,
		Typography,
		DropdownMenu,
		createDropdownMenu,
	} from '@peopleplus/components';
	import { twMerge } from 'tailwind-merge';

	interface Props {
		class?: string | null | undefined;
		href?: string | null | undefined;
		name: string;
		email: string;
		avatar?: string | null | undefined;
		actions?: import('svelte').Snippet;
	}

	let {
		class: className = undefined,
		href = undefined,
		name,
		email,
		avatar = undefined,
		actions,
	}: Props = $props();

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
	<DropdownMenu {menu}>{@render actions?.()}</DropdownMenu>
{/if}
