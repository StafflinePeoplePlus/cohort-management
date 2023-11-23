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
} from '../errors.js';
import type { Resolvers } from './schemaTypes.js';

export const resolvers: Resolvers<{ cohortAdapter: CohortAdapter }> = {
	Mutation: {
		async cohortInviteMember(_parent, { input }, { cohortAdapter }) {
			try {
				// TODO: authorization

				const existingInvite = await cohortAdapter.findInviteByEmail(input.email);
				if (existingInvite !== undefined) {
					throw new MemberAlreadyInvitedError(input.email);
				}

				const existingMember = await cohortAdapter.findMemberByEmail(input.email);
				if (existingMember !== undefined) {
					throw new MemberAlreadySignedUpError(input.email);
				}

				const invite = await cohortAdapter.createInvite(input.email, input.metadata);

				try {
					await cohortAdapter.sendInvite(invite);
				} catch (err) {
					throw new SendInviteFailed(invite.id, input.email, err);
				}

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
		async cohortRevokeMemberInvite(_parent, { inviteID }, { cohortAdapter }) {
			try {
				const invite = await cohortAdapter.findInviteByID(inviteID);
				if (!invite) {
					throw new InviteNotFoundToRevoke(inviteID);
				}

				try {
					await cohortAdapter.revokeInvite(invite);
				} catch (err) {
					throw new RevokeInviteFailed(inviteID, err);
				}

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
		cohortMemberInvitesCount(_parent, _args, { cohortAdapter }) {
			return cohortAdapter.countInvites();
		},
		async cohortMemberInvites(_parent, _args, { cohortAdapter }) {
			const invites = await cohortAdapter.listInvites();
			return { items: invites };
		},
	},
};
