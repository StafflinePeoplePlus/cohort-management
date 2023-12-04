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
} from '../errors.js';
import type { Resolvers } from './schemaTypes.js';

type ResolverContext = RequestEvent & { cohortAdapter: CohortAdapter<never> };

export const resolvers: Resolvers<ResolverContext> = {
	Mutation: {
		async cohortInviteMember(_parent, { input }, ctx) {
			const { cohortAdapter } = ctx;
			try {
				await assertAuth(ctx, ['cohort:invite:create']);

				const existingInvite = await cohortAdapter.findInviteByEmail(input.email);
				if (existingInvite !== undefined) {
					throw new MemberAlreadyInvitedError(input.email);
				}

				const existingMember = await cohortAdapter.findMemberByEmail(input.email);
				if (existingMember !== undefined) {
					throw new MemberAlreadySignedUpError(input.email);
				}

				const invite = await cohortAdapter.createInvite(input.email, input.metadata);

				await wrapError(
					cohortAdapter.sendInvite(invite),
					(cause) => new SendInviteFailed(invite.id, input.email, cause),
				);

				return {
					__typename: 'CohortMemberInvite',
					id: invite.id,
					email: invite.email,
					metadata: invite.metadata,
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
					message: 'An unexpected error occurred',
				};
			}
		},
		async cohortRevokeMemberInvite(_parent, { inviteID }, ctx) {
			const { cohortAdapter } = ctx;
			try {
				await assertAuth(ctx, ['cohort:invite:delete']);

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
					message: 'An unexpected error occurred',
				};
			}
		},
	},
	Query: {
		async cohortMemberInvitesCount(_parent, _args, ctx) {
			await assertAuth(ctx, ['cohort:invite:read']);
			return ctx.cohortAdapter.countInvites();
		},
		async cohortMemberInvites(_parent, _args, ctx) {
			await assertAuth(ctx, ['cohort:invite:read']);
			const invites = await ctx.cohortAdapter.listInvites();
			return { items: invites };
		},
		async cohortMember(_parent, { id }, ctx) {
			await assertAuth(ctx, ['cohort:member:read']);
			const member = await ctx.cohortAdapter.findMemberByID(id);
			// Kind of dumb but because we don't define any types that implement the CohortMember
			// graphql interface, the types get generated as 'never'. In practise, the consumer of
			// this library will be defining their own types that implement the interface.
			return (member as never) ?? null;
		},
		async cohortMembers(_parent, { query }, ctx) {
			await assertAuth(ctx, ['cohort:member:read']);
			const members = query
				? await ctx.cohortAdapter.searchMembers(query)
				: await ctx.cohortAdapter.listMembers();
			return { items: members };
		},
	},
};

/**
 * Throws if the actor is not authenticated or not authorized with the given scopes.
 */
async function assertAuth(ctx: ResolverContext, scopes: string[]) {
	const authContext = await wrapError(
		ctx.cohortAdapter.authenticate(ctx),
		(cause) => new AuthenticationError('cohortInviteMember', cause),
	);
	if (!authContext) {
		throw new AuthenticationError('cohortInviteMember');
	}

	const authorized = await wrapError(
		ctx.cohortAdapter.authorize(authContext, scopes),
		(cause) => new AuthorisationError('cohortInviteMember', scopes, cause),
	);
	if (!authorized) {
		throw new AuthorisationError('cohortInviteMember', scopes);
	}
}
