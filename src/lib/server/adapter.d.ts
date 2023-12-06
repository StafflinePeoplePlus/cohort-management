import type { Invite } from '../types/Invite.js';
import type { CohortMember } from '../types/CohortMember.js';
import type { UnexpectedError } from './errors.js';
import type { RequestEvent } from '@sveltejs/kit';

export type CohortAdapter<AuthContext, Permission = string> = StorageAdapter &
	AuthAdapter<AuthContext, Permission> & {
		/**
		 * Called whenever an unexpected error occurs in the CohortManagement system.
		 * This function can be used to log the error and/or send it to a monitoring service.
		 * However, it does not provide a way to recover from the error.
		 */
		onUnexpectedError(error: UnexpectedError): Promise<void> | void;
	};

export type StorageAdapter = {
	createInvite(
		email: string,
		metadata: CohortManagement.CohortMemberMetadataInput,
	): Promise<Invite>;
	/**
	 * Send an invite to the given email address. It is not strictly a requirement for the email to
	 * be sent out immediately, you may choose to send it to a background job queue for example.
	 *
	 * It is up to the implementation to retry sending the invite if it fails, any errors thrown will
	 * be logged but otherwise ignored.
	 */
	sendInvite(invite: Invite): Promise<void>;
	/**
	 * Revokes an invite that has been sent out but has not yet been accepted.
	 *
	 * You may choose to delete the invite from the database, or simply mark it as revoked.
	 */
	revokeInvite(invite: Invite): Promise<void>;
	/**
	 * Returns the number of invites that have been sent out but have not yet been accepted.
	 */
	countInvites(): Promise<number>;
	/**
	 * Returns a list of all invites that have been sent out but have not yet been accepted or
	 * revoked.
	 */
	listInvites(): Promise<Invite[]>;
	findInviteByID(id: string): Promise<Invite | undefined>;
	findInviteByEmail(email: string): Promise<Invite | undefined>;

	findMemberByEmail(email: string): Promise<CohortMember | undefined>;
	findMemberByID(id: string): Promise<CohortMember | undefined>;
	searchMembers(query: string): Promise<CohortMember[]>;
	listMembers(): Promise<CohortMember[]>;

	findRoleByID(id: string): Promise<CohortManagement.Role | undefined>;
};

export type AuthAdapter<AuthContext, Permission = string> = {
	/**
	 * Mapping of built-in permissions to the adapter's chosen representation.
	 */
	permissions: {
		invite: {
			create: Permission;
			read: Permission;
			delete: Permission;
		};
		member: {
			read: Permission;
		};
		role: {
			assign: Permission;
		};
	};

	/**
	 *  Authenticate the actor from the request event context, returning the auth context if
	 *  successful.
	 */
	authenticate(event: RequestEvent): Promise<AuthContext | undefined>;

	/**
	 * Return true if the actor is authorized with the requested permissions.
	 */
	authorize(authContext: AuthContext, permissions: Permission[]): Promise<boolean>;

	/**
	 * Assign the given role to the given member.
	 */
	assignRole(member: CohortMember, role: CohortManagement.Role): Promise<void>;

	/**
	 * Unassign the given role from the given member.
	 */
	unassignRole(member: CohortMember, role: CohortManagement.Role): Promise<void>;
};
