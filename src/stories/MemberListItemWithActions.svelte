<script lang="ts">
	import { MemberListItem } from '$lib/client.js';
	import { DropdownMenuDivider, DropdownMenuItem } from '@peopleplus/components';

	export let name: string;
	export let email: string;
</script>

<MemberListItem
	{name}
	{email}
	actions={[
		{ type: 'link', href: '#', label: 'View Details', variant: 'default' },
		{ type: 'link', href: '#', label: 'Edit Details', variant: 'default' },
		{ type: 'divider' },
		{ type: 'link', href: '#', label: 'Delete', variant: 'danger' },
	]}
	{...$$restProps}
/>
