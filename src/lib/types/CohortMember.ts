import type { Opaque } from 'type-fest';

type PlainMember = { id: string; [k: string]: unknown };
export type CohortMember = Opaque<PlainMember, 'CohortMember'>;

export function create(member: PlainMember) {
	return member as CohortMember;
}
