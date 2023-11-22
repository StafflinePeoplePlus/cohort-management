import type { Invite } from '../types/Invite.js';
import type { CohortMember } from '../types/CohortMember.js';
import type { UnexpectedError } from './errors.js';

export type CohortAdapter = {
	/**
	 * Called whenever an unexpected error occurs in the CohortManagement system.
	 * This function can be used to log the error and/or send it to a monitoring service.
	 * However, it does not provide a way to recover from the error.
	 */
	onUnexpectedError(error: UnexpectedError): Promise<void> | void;

	createInvite(
		email: string,
		metadata: CohortManagement.CohortMemberMetadataInput
	): Promise<Invite>;
	/**
	 * Send an invite to the given email address. It is not strictly a requirement for the email to
	 * be sent out immediately, you may choose to send it to a background job queue for example.
	 *
	 * It is up to the implementation to retry sending the invite if it fails, any errors thrown will
	 * be logged but otherwise ignored.
	 */
	sendInvite(invite: Invite): Promise<void>;
	findInviteByEmail(email: string): Promise<Invite | undefined>;
	findMemberByEmail(email: string): Promise<CohortMember | undefined>;
};
