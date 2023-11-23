<script lang="ts">
	import { MemberListItem } from '$lib/client.js';
	import { DropdownMenuDivider, DropdownMenuItem } from 'pp-svelte-components';

	export let name: string;
	export let email: string;
</script>

<MemberListItem {name} {email} {...$$restProps}>
	<svelte:fragment slot="actions">
		<DropdownMenuItem>View Details</DropdownMenuItem>
		<DropdownMenuItem>Edit Details</DropdownMenuItem>
		<DropdownMenuDivider />
		<DropdownMenuItem variant="danger">Delete</DropdownMenuItem>
	</svelte:fragment>
</MemberListItem>
