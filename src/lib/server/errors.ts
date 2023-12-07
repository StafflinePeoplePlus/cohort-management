import type {
	CohortInviteMemberError as GQLInviteMemberError,
	CohortRevokeMemberInviteError as GQLRevokeMemberInviteError,
	CohortMemberRoleChangeError as GQLCohortMemberRoleChangeError,
} from './graphql/schemaTypes.js';

export async function wrapError<T>(
	promise: Promise<T>,
	wrapError: (err: unknown) => Error,
): Promise<T> {
	try {
		return await promise;
	} catch (err) {
		throw wrapError(err);
	}
}

export class UnexpectedError extends Error {
	constructor(message: string, cause?: unknown) {
		super(message, { cause });
	}

	get publicMessage() {
		return 'An unexpected error occurred';
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
export class AuthenticationError extends UnexpectedError {
	constructor(
		public resolver: string,
		cause?: unknown,
	) {
		super(`Authentication failed in resolver of ${resolver}`, cause);
	}
}
export class AuthorisationError extends UnexpectedError {
	constructor(
		public resolver: string,
		public permissions: unknown[],
		cause?: unknown,
	) {
		super(
			`Authorisation failed in resolver of ${resolver} with the requested permissions [${permissions.join(
				', ',
			)}]`,
			cause,
		);
	}

	get publicMessage() {
		return `Missing permission(s) ${this.permissions.join(', ')}`;
	}
}

export abstract class InviteMemberError extends Error {
	abstract toGraphQL(): GQLInviteMemberError;
}
export class UnknownRoleForInvite extends InviteMemberError {
	constructor(
		public roleID: string,
		cause?: unknown,
	) {
		super(`Role not found with ID \`${roleID}\``, { cause });
	}

	toGraphQL(): GQLInviteMemberError {
		return {
			__typename: 'CohortInviteMemberError',
			reason: 'UNKNOWN_ROLE',
			message: this.message,
		};
	}
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
		cause?: unknown,
	) {
		super(`Failed to revoke invite with ID \`${inviteID}\``, cause);
	}
}

export abstract class RoleChangeError extends Error {
	abstract toGraphQL(): GQLCohortMemberRoleChangeError;
}
export class UnknownRole extends RoleChangeError {
	constructor(
		public roleID: string,
		cause?: unknown,
	) {
		super(`Role not found with ID \`${roleID}\``, { cause });
	}

	toGraphQL(): GQLCohortMemberRoleChangeError {
		return {
			__typename: 'CohortMemberRoleChangeError',
			reason: 'UNKNOWN_ROLE',
			message: this.message,
		};
	}
}
export class MemberNotFoundForRoleChange extends RoleChangeError {
	constructor(
		public memberID: string,
		cause?: unknown,
	) {
		super(`A member with the ID \`${memberID}\` could not be found`, { cause });
	}

	toGraphQL(): GQLCohortMemberRoleChangeError {
		return {
			__typename: 'CohortMemberRoleChangeError',
			reason: 'MEMBER_NOT_FOUND',
			message: this.message,
		};
	}
}
