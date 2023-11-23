import type {
	CohortInviteMemberError as GQLInviteMemberError,
	CohortRevokeMemberInviteError as GQLRevokeMemberInviteError,
} from './graphql/schemaTypes.js';

export class UnexpectedError extends Error {
	constructor(message: string, cause?: unknown) {
		super(message, { cause });
	}

	static wrapForResolver(resolver: string, err: unknown): UnexpectedError {
		return err instanceof UnexpectedError
			? err
			: new UnexpectedError(`Unexpected error in resolver of ${resolver}`, err);
	}
}

export class SendInviteFailed extends UnexpectedError {
	constructor(
		public inviteID: string,
		public email: string,
		cause: unknown,
	) {
		super(`Failed to sent invite email out to \`${email}\` for invite ID \`${inviteID}\``, cause);
	}
}

export abstract class InviteMemberError extends Error {
	abstract toGraphQL(): GQLInviteMemberError;
}
export class MemberAlreadyInvitedError extends InviteMemberError {
	constructor(public email: string) {
		super(`A member with the email \`${email}\` has already been invited`);
	}

	toGraphQL(): GQLInviteMemberError {
		return {
			__typename: 'CohortInviteMemberError',
			reason: 'ALREADY_INVITED',
			message: this.message,
		};
	}
}
export class MemberAlreadySignedUpError extends InviteMemberError {
	constructor(public email: string) {
		super(`A member with the email \`${email}\` has already signed up`);
	}

	toGraphQL(): GQLInviteMemberError {
		return {
			__typename: 'CohortInviteMemberError',
			reason: 'ALREADY_MEMBER',
			message: this.message,
		};
	}
}

export abstract class RevokeMemberInviteError extends Error {
	abstract toGraphQL(): GQLRevokeMemberInviteError;
}
export class InviteNotFoundToRevoke extends RevokeMemberInviteError {
	constructor(public inviteID: string) {
		super(`Member invite with ID \`${inviteID}\` could not be found to revoke`);
	}

	toGraphQL(): GQLRevokeMemberInviteError {
		return {
			__typename: 'CohortRevokeMemberInviteError',
			reason: 'INVITE_NOT_FOUND',
			message: this.message,
		};
	}
}
export class RevokeInviteFailed extends UnexpectedError {
	constructor(
		public inviteID: string,
		cause: unknown,
	) {
		super(`Failed to revoke invite with ID \`${inviteID}\``, cause);
	}
}
