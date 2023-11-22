import { Opaque } from "type-fest";

type PlainMember = { id: string };
export type CohortMember = Opaque<PlainMember, "CohortMember">;

export function create(member: PlainMember) {
    return member as CohortMember;
}
