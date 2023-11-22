import type { Opaque } from 'type-fest';

type PlainInvite = { id: string; email: string };
export type Invite = Opaque<PlainInvite, 'Invite'>;

export function create(invite: PlainInvite) {
	return invite as Invite;
}
