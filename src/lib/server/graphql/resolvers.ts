import type { RequestEvent } from '@sveltejs/kit';
import type { CohortAdapter } from '../adapter.js';
import {
	MemberAlreadyInvitedError,
	InviteMemberError,
	SendInviteFailed,
	UnexpectedError,
	MemberAlreadySignedUpError,
	InviteNotFoundToRevoke,
	RevokeMemberInviteError,
	RevokeInviteFailed,
	AuthenticationError,
	wrapError,
	AuthorisationError,
	UnknownRole,
	RoleChangeError,
	MemberNotFoundForRoleChange,
	UnknownRoleForInvite,
	InviteNotFoundToRedeem,
	RedeemInviteFailed,
	RedeemMemberInviteError,
} from '../errors.js';
import type { Resolvers } from './schemaTypes.js';

type UnresolvedType = never;
type Permission = UnresolvedType;
type ResolverContext = RequestEvent & {
	cohortAdapter: CohortAdapter<UnresolvedType, Permission>;
};

export const resolvers: Resolvers<ResolverContext> = {
	Mutation: {
		async cohortInviteMember(_parent, { input }, ctx) {
			const { cohortAdapter } = ctx;
			try {
				await assertAuth(ctx, [cohortAdapter.permissions.invite.create]);

				if (input.roleIDs) {
					await Promise.all(
						input.roleIDs.map(async (id) => {
							const role = await cohortAdapter.findRoleByID(id);
							if (role === undefined) {
								throw new UnknownRoleForInvite(id);
							}
						}),
					);
				}

				const existingInvite = await cohortAdapter.findInviteByEmail(input.email);
				if (existingInvite !== undefined) {
					throw new MemberAlreadyInvitedError(input.email);
				}

				const existingMember = await cohortAdapter.findMemberByEmail(input.email);
				if (existingMember !== undefined) {
					throw new MemberAlreadySignedUpError(input.email);
				}

				const invite = await cohortAdapter.createInvite({
					email: input.email,
					roleIDs: input.roleIDs ?? [],
					metadata: input.metadata,
				});

				await wrapError(
					cohortAdapter.sendInvite(invite),
					(cause) => new SendInviteFailed(invite.id, input.email, cause),
				);

				return {
					__typename: 'CohortMemberInvite',
					id: invite.id,
					email: invite.email,
					metadata: invite.metadata,
					roleIDs: invite.roleIDs,
				};
			} catch (err) {
				if (err instanceof InviteMemberError) {
					return err.toGraphQL();
				}

				await cohortAdapter.onUnexpectedError(
					UnexpectedError.wrapForResolver('Mutation.cohortInviteMember', err),
				);
				return {
					__typename: 'CohortInviteMemberError',
					reason: 'UNEXPECTED',
					message:
						err instanceof UnexpectedError ? err.publicMessage : 'An unexpected error occurred',
				};
			}
		},
		async cohortRevokeMemberInvite(_parent, { inviteID }, ctx) {
			const { cohortAdapter } = ctx;
			try {
				await assertAuth(ctx, [cohortAdapter.permissions.invite.delete]);

				const invite = await cohortAdapter.findInviteByID(inviteID);
				if (!invite) {
					throw new InviteNotFoundToRevoke(inviteID);
				}

				await wrapError(
					cohortAdapter.revokeInvite(invite),
					(cause) => new RevokeInviteFailed(inviteID, cause),
				);

				return {
					__typename: 'CohortMemberInvite',
					id: invite.id,
					email: invite.email,
					metadata: invite.metadata,
					roleIDs: invite.roleIDs,
				};
			} catch (err) {
				if (err instanceof RevokeMemberInviteError) {
					return err.toGraphQL();
				}

				await cohortAdapter.onUnexpectedError(
					UnexpectedError.wrapForResolver('Mutation.cohortRevokeMemberInvite', err),
				);
				return {
					__typename: 'CohortRevokeMemberInviteError',
					reason: 'UNEXPECTED',
					message:
						err instanceof UnexpectedError ? err.publicMessage : 'An unexpected error occurred',
				};
			}
		},
		async cohortRedeemMemberInvite(_parent, { inviteID }, ctx) {
			const { cohortAdapter } = ctx;
			try {
				const invite = await cohortAdapter.findInviteByID(inviteID);
				if (!invite) {
					throw new InviteNotFoundToRedeem(inviteID);
				}

				const member = await wrapError(
					cohortAdapter.redeemInvite(ctx, invite),
					(cause) => new RedeemInviteFailed(inviteID, cause),
				);
				return {
					__typename: 'CohortRedeemMemberInvite',
					member,
				};
			} catch (err) {
				if (err instanceof RedeemMemberInviteError) {
					return err.toGraphQL();
				}

				console.log(err);
				await cohortAdapter.onUnexpectedError(
					UnexpectedError.wrapForResolver('Mutation.cohortRedeemMemberInvite', err),
				);
				return {
					__typename: 'CohortRedeemMemberInviteError',
					reason: 'UNEXPECTED',
					message:
						err instanceof UnexpectedError ? err.publicMessage : 'An unexpected error occurred',
				};
			}
		},
		async cohortMemberAddRole(_parent, { memberID, roleID }, ctx) {
			const { cohortAdapter } = ctx;
			try {
				await assertAuth(ctx, [cohortAdapter.permissions.role.assign]);

				const role = await cohortAdapter.findRoleByID(roleID);
				if (role === undefined) {
					throw new UnknownRole(roleID);
				}

				const member = await cohortAdapter.findMemberByID(memberID);
				if (member === undefined) {
					throw new MemberNotFoundForRoleChange(memberID);
				}

				await cohortAdapter.assignRole(member, role);
				return {
					__typename: 'CohortMemberRoleChange',
					memberID: member.id,
					role: role,
				};
			} catch (err) {
				if (err instanceof RoleChangeError) {
					return err.toGraphQL();
				}

				await cohortAdapter.onUnexpectedError(
					UnexpectedError.wrapForResolver('Mutation.cohortMemberAddRole', err),
				);
				return {
					__typename: 'CohortMemberRoleChangeError',
					reason: 'UNEXPECTED',
					message:
						err instanceof UnexpectedError ? err.publicMessage : 'An unexpected error occurred',
				};
			}
		},
		async cohortMemberRemoveRole(_parent, { memberID, roleID }, ctx) {
			const { cohortAdapter } = ctx;
			try {
				await assertAuth(ctx, [cohortAdapter.permissions.role.assign]);

				const role = await cohortAdapter.findRoleByID(roleID);
				if (role === undefined) {
					throw new UnknownRole(roleID);
				}

				const member = await cohortAdapter.findMemberByID(memberID);
				if (member === undefined) {
					throw new MemberNotFoundForRoleChange(memberID);
				}

				await cohortAdapter.unassignRole(member, role);
				return {
					__typename: 'CohortMemberRoleChange',
					memberID: member.id,
					role,
				};
			} catch (err) {
				if (err instanceof RoleChangeError) {
					return err.toGraphQL();
				}

				await cohortAdapter.onUnexpectedError(
					UnexpectedError.wrapForResolver('Mutation.cohortMemberAddRole', err),
				);
				return {
					__typename: 'CohortMemberRoleChangeError',
					reason: 'UNEXPECTED',
					message:
						err instanceof UnexpectedError ? err.publicMessage : 'An unexpected error occurred',
				};
			}
		},
	},
	Query: {
		async cohortMemberInvitesCount(_parent, _args, ctx) {
			await assertAuth(ctx, [ctx.cohortAdapter.permissions.invite.read]);
			return ctx.cohortAdapter.countInvites();
		},
		async cohortMemberInvites(_parent, _args, ctx) {
			await assertAuth(ctx, [ctx.cohortAdapter.permissions.invite.read]);
			const invites = await ctx.cohortAdapter.listInvites();
			return { items: invites };
		},
		async cohortMember(_parent, { id }, ctx) {
			await assertAuth(ctx, [ctx.cohortAdapter.permissions.member.read]);
			const member = await ctx.cohortAdapter.findMemberByID(id);
			// Kind of dumb but because we don't define any types that implement the CohortMember
			// graphql interface, the types get generated as 'never'. In practise, the consumer of
			// this library will be defining their own types that implement the interface.
			return (member as UnresolvedType) ?? null;
		},
		async cohortMembers(_parent, { query }, ctx) {
			await assertAuth(ctx, [ctx.cohortAdapter.permissions.member.read]);
			const members = query
				? await ctx.cohortAdapter.searchMembers(query)
				: await ctx.cohortAdapter.listMembers();
			return { items: members };
		},
		async cohortRoles(_parent, _args, ctx) {
			await assertAuth(ctx, [ctx.cohortAdapter.permissions.role.read]);
			const roles = await ctx.cohortAdapter.listRoles();
			return { items: roles };
		},
	},
};

/**
 * Throws if the actor is not authenticated or not authorized with the given roles.
 */
async function assertAuth(ctx: ResolverContext, permissions: Permission[]) {
	const authContext = await wrapError(
		ctx.cohortAdapter.authenticate(ctx),
		(cause) => new AuthenticationError('cohortInviteMember', cause),
	);
	if (!authContext) {
		throw new AuthenticationError('cohortInviteMember');
	}

	const authorized = await wrapError(
		ctx.cohortAdapter.authorize(authContext, permissions),
		(cause) => new AuthorisationError('cohortInviteMember', permissions, cause),
	);
	if (!authorized) {
		throw new AuthorisationError('cohortInviteMember', permissions);
	}
}
