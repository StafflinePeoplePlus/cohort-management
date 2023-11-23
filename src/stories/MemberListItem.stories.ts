import { MemberListItem } from '$lib/client.js';
import type { Meta, StoryObj } from '@storybook/svelte';
import MemberListItemWithActions from './MemberListItemWithActions.svelte';
import { faker } from '@faker-js/faker/locale/en_GB';

const meta = {
	title: 'Members/MemberListItem',
	component: MemberListItem,
	argTypes: {
		email: { control: 'text' },
		class: { control: 'text' },
		href: { control: 'text' },
		avatar: { control: 'text' },
	},
	args: {
		name: faker.person.fullName(),
		email: faker.internet.exampleEmail(),
	},
} satisfies Meta<MemberListItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithActions: Story = {
	render: (args) => ({ Component: MemberListItemWithActions, props: args }),
};
