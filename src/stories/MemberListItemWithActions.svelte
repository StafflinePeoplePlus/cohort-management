<script lang="ts">
	import { MemberListItem } from '$lib/client.js';
	import { DropdownMenuDivider, DropdownMenuItem } from '@peopleplus/components';

	interface Props {
		name: string;
		email: string;
		/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
		[key: string]: any;
	}

	let { name, email, ...rest }: Props = $props();
</script>

<MemberListItem {name} {email} {...rest}>
	{#snippet actions()}
		<DropdownMenuItem>View Details</DropdownMenuItem>
		<DropdownMenuItem>Edit Details</DropdownMenuItem>
		<DropdownMenuDivider />
		<DropdownMenuItem variant="danger">Delete</DropdownMenuItem>
	{/snippet}
</MemberListItem>
