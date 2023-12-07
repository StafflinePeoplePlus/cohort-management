import type { Opaque } from 'type-fest';

export type PlainInvite = {
	id: string;
	email: string;
	roleIDs: string[];
	metadata: CohortManagement.CohortMemberMetadata;
};
export type Invite = Opaque<PlainInvite, 'Invite'>;

export function create(invite: PlainInvite) {
	return invite as Invite;
}
