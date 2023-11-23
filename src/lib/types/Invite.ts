import type { Opaque } from 'type-fest';

type PlainInvite = { id: string; email: string; metadata: CohortManagement.CohortMemberMetadata };
export type Invite = Opaque<PlainInvite, 'Invite'>;

export function create(invite: PlainInvite) {
	return invite as Invite;
}
