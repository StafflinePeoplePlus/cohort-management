<script lang="ts">
	import { InviteListItem } from '$lib/client.js';
	import BanIcon from 'lucide-svelte/icons/ban';
	import BracesIcon from 'lucide-svelte/icons/braces';
	import SendIcon from 'lucide-svelte/icons/send';
	import { DropdownMenuDivider, DropdownMenuItem } from '@peopleplus/components';

	export let email: string;
</script>

<InviteListItem {email} {...$$restProps}>
	<svelte:fragment slot="actions">
		<DropdownMenuItem variant="primary">
			<SendIcon size={16} />
			Resend
		</DropdownMenuItem>
		<DropdownMenuItem>
			<BracesIcon size={16} />
			View Metadata
		</DropdownMenuItem>
		<DropdownMenuDivider />
		<DropdownMenuItem variant="danger">
			<BanIcon size={16} />
			Revoke
		</DropdownMenuItem>
	</svelte:fragment>
</InviteListItem>
