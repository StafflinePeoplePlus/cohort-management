<script lang="ts">
	import { InviteListItem } from '$lib/client.js';
	import BanIcon from 'lucide-svelte/icons/ban';
	import BracesIcon from 'lucide-svelte/icons/braces';
	import SendIcon from 'lucide-svelte/icons/send';
	import { DropdownMenuDivider, DropdownMenuItem } from '@peopleplus/components';

	export let email: string;
</script>

<InviteListItem
	{email}
	actions={[
		{ type: 'action', label: 'Resend', variant: 'primary', action: () => null },
		{ type: 'action', label: 'View Metadata', variant: 'default', action: () => null },
		{ type: 'divider' },
		{ type: 'action', label: 'Revoke', variant: 'danger', action: () => null },
	]}
	{...$$restProps}
/>
