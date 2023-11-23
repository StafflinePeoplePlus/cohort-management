import type { CohortAdapter } from '../adapter.js';
import {
	MemberAlreadyInvitedError,
	InviteMemberError,
	SendInviteFailed,
	UnexpectedError,
	MemberAlreadySignedUpError
} from '../errors.js';
import type { Resolvers } from './generated.js';

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
					inviteID: invite.id
				};
			} catch (err) {
				if (err instanceof InviteMemberError) {
					return err.toGraphQL();
				}

				await cohortAdapter.onUnexpectedError(
					UnexpectedError.wrapForResolver('Mutation.cohortInviteMember', err)
				);
				return {
					__typename: 'CohortInviteMemberError',
					reason: 'UNEXPECTED',
					message: 'An unexpected error occurred'
				};
			}
		}
	},
	Query: {
		cohortMemberInvitesCount(_parent, _args, { cohortAdapter }) {
			return cohortAdapter.countInvites();
		}
	}
};
