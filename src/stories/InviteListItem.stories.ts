import { InviteListItem } from '$lib/client.js';
import type { Meta, StoryObj } from '@storybook/svelte';
import { faker } from '@faker-js/faker/locale/en_GB';
import InviteListItemWithActions from './InviteListItemWithActions.svelte';

const meta = {
	title: 'Invites/InviteListItem',
	component: InviteListItem,
	argTypes: {
		email: { control: 'text' },
		class: { control: 'text' },
		href: { control: 'text' },
	},
	args: {
		email: faker.internet.exampleEmail(),
	},
} satisfies Meta<InviteListItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithActions: Story = {
	render: (args) => ({ Component: InviteListItemWithActions, props: args }),
};
