<script lang="ts">
	import { InviteListItem } from '$lib/client.js';

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
