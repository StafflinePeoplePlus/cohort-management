/* eslint-disable @typescript-eslint/no-explicit-any */
import { test, expect, vi, describe } from 'vitest';
import { createSchema, createYoga } from 'graphql-yoga';
import type { CohortAdapter } from '$lib/server';
import { buildHTTPExecutor } from '@graphql-tools/executor-http';
import { parse as gql } from 'graphql';
import { resolvers } from './resolvers.js';
import typeDefs, { defaults } from './schema.js';
import { faker } from '@faker-js/faker/locale/en_GB';
import { CohortMember, Invite } from '$lib';
import type { PlainInvite } from '$lib/types/Invite.js';

type AuthContext = { userID: string };
function createMockAdapter(mocks: Partial<CohortAdapter<AuthContext>>): CohortAdapter<AuthContext> {
	const abort =
		(name: string) =>
		(...args: unknown[]) => {
			throw new Error(
				`\`${name}\` was not expected to be called in this test. Called with args: [${args.join(
					', ',
				)}]`,
			);
		};
	return {
		onUnexpectedError:
			mocks.onUnexpectedError ??
			((cause) => {
				throw new Error('`onUnexpectedError` was not expected to be called in this test.', {
					cause,
				});
			}),
		createInvite: mocks.createInvite ?? abort('createInvite'),
		sendInvite: mocks.sendInvite ?? abort('sendInvite'),
		revokeInvite: mocks.revokeInvite ?? abort('revokeInvite'),
		countInvites: mocks.countInvites ?? abort('countInvites'),
		listInvites: mocks.listInvites ?? abort('listInvites'),
		findInviteByID: mocks.findInviteByID ?? abort('findInviteByID'),
		findInviteByEmail: mocks.findInviteByEmail ?? abort('findInviteByEmail'),
		findMemberByEmail: mocks.findMemberByEmail ?? abort('findMemberByEmail'),
		findMemberByID: mocks.findMemberByID ?? abort('findMemberByID'),
		searchMembers: mocks.searchMembers ?? abort('searchMembers'),
		listMembers: mocks.listMembers ?? abort('listMembers'),
		deleteMember: mocks.deleteMember ?? abort('deleteMember'),
		redeemInvite: mocks.redeemInvite ?? abort('redeemInvite'),
		listRoles: mocks.listRoles ?? abort('listRoles'),
		findRoleByID: mocks.findRoleByID ?? abort('findRoleByID'),

		permissions: {
			invite: {
				create: faker.string.uuid(),
				read: faker.string.uuid(),
				delete: faker.string.uuid(),
			},
			member: {
				read: faker.string.uuid(),
				delete: faker.string.uuid(),
			},
			role: {
				read: faker.string.uuid(),
				assign: faker.string.uuid(),
			},
		},
		authenticate: mocks.authenticate ?? (() => Promise.resolve({ userID: 'test' })),
		authorize: mocks.authorize ?? (() => Promise.resolve(true)),
		assignRole: mocks.assignRole ?? abort('assignRole'),
		unassignRole: mocks.unassignRole ?? abort('unassignRole'),
	};
}

const testSchema = /* GraphQL */ `
	type TestMember implements CohortMember {
		id: ID!
	}
	type TestRole implements CohortRole {
		id: ID!
		name: String!
		description: String!
	}
`;

function createGraphQLServer(cohortAdapter: CohortAdapter<AuthContext>) {
	const schema = createSchema({
		typeDefs: [typeDefs, defaults, testSchema],
		resolvers: {
			...resolvers,
			CohortMember: {
				__resolveType() {
					return 'TestMember';
				},
			},
			CohortRole: {
				__resolveType() {
					return 'TestRole';
				},
			},
		},
	});
	const yoga = createYoga({ schema, context: { cohortAdapter } });
	return buildHTTPExecutor({
		fetch: yoga.fetch,
	});
}

describe('Query', () => {
	describe('cohortMemberInvitesCount', () => {
		test('returns the invite count', async () => {
			const countInvites = vi.fn(() => Promise.resolve(42));
			const adapter = createMockAdapter({ countInvites });
			const request = createGraphQLServer(adapter);

			const result = await request({
				document: gql(`
					query {
						cohortMemberInvitesCount
					}
				`),
			});

			expect(result).toEqual({
				data: {
					cohortMemberInvitesCount: 42,
				},
			});
			expect(countInvites).toHaveBeenCalledOnce();
		});

		test('requires invite read role', async () => {
			const onUnexpectedError = vi.fn();
			const countInvites = vi.fn(() => Promise.resolve(42));
			const authorize = vi.fn(() => Promise.resolve(false));
			const adapter = createMockAdapter({ onUnexpectedError, countInvites, authorize });
			const request = createGraphQLServer(adapter);

			const result = await request({
				document: gql(`
					query {
						cohortMemberInvitesCount
					}
				`),
			});

			expect((result as any).errors).toHaveLength(1);
			expect((result as any).data.cohortMemberInvitesCount).toBeNull();
			expect(authorize).toHaveBeenCalledWith({ userID: 'test' }, [adapter.permissions.invite.read]);
		});
	});

	describe('cohortMemberInvites', () => {
		test('returns an empty list when there are no invites', async () => {
			const listInvites = vi.fn(() => Promise.resolve([]));
			const adapter = createMockAdapter({ listInvites });
			const request = createGraphQLServer(adapter);

			const result = await request({
				document: gql(`
					query {
						cohortMemberInvites {
							items {
								id
								email
							}
						}
					}
				`),
			});

			expect(result).toEqual({
				data: {
					cohortMemberInvites: { items: [] },
				},
			});
			expect(listInvites).toHaveBeenCalledOnce();
		});

		test('returns a list of invites', async () => {
			const invites = [fakeInvite(), fakeInvite(), fakeInvite()];
			const listInvites = vi.fn(() => Promise.resolve(invites));
			const adapter = createMockAdapter({ listInvites });
			const request = createGraphQLServer(adapter);

			const result = await request({
				document: gql(`
					query {
						cohortMemberInvites {
							items {
								id
								email
							}
						}
					}
				`),
			});

			expect(result).toEqual({
				data: {
					cohortMemberInvites: {
						items: [
							{ id: invites[0].id, email: invites[0].email },
							{ id: invites[1].id, email: invites[1].email },
							{ id: invites[2].id, email: invites[2].email },
						],
					},
				},
			});
			expect(listInvites).toHaveBeenCalledOnce();
		});

		test('requires invite read role', async () => {
			const onUnexpectedError = vi.fn();
			const listInvites = vi.fn(() => Promise.resolve([]));
			const authorize = vi.fn(() => Promise.resolve(false));
			const adapter = createMockAdapter({ onUnexpectedError, listInvites, authorize });
			const request = createGraphQLServer(adapter);

			const result = await request({
				document: gql(`
					query {
						cohortMemberInvites {
							__typename
						}
					}
				`),
			});

			expect((result as any).errors).toHaveLength(1);
			expect((result as any).data.cohortMemberInvites).toBeNull();
			expect(authorize).toHaveBeenCalledWith({ userID: 'test' }, [adapter.permissions.invite.read]);
		});
	});

	describe('cohortMember', () => {
		test('returns null when the member is not found', async () => {
			const findMemberByID = vi.fn(() => Promise.resolve(undefined));
			const adapter = createMockAdapter({ findMemberByID });
			const request = createGraphQLServer(adapter);

			const memberID = faker.string.uuid();
			const result = await request({
				document: gql(`
					query FindMember($id: ID!) {
						cohortMember(id: $id) {
							id
						}
					}
				`),
				variables: { id: memberID },
			});

			expect(result).toEqual({
				data: {
					cohortMember: null,
				},
			});
			expect(findMemberByID).toHaveBeenCalledOnce();
			expect(findMemberByID).toHaveBeenCalledWith(memberID);
		});

		test('returns member when found by id', async () => {
			const memberID = faker.string.uuid();
			const findMemberByID = vi.fn(() => Promise.resolve(CohortMember.create({ id: memberID })));
			const adapter = createMockAdapter({ findMemberByID });
			const request = createGraphQLServer(adapter);

			const result = await request({
				document: gql(`
					query FindMember($id: ID!) {
						cohortMember(id: $id) {
							id
						}
					}
				`),
				variables: { id: memberID },
			});

			expect(result).toEqual({
				data: {
					cohortMember: { id: memberID },
				},
			});
			expect(findMemberByID).toHaveBeenCalledOnce();
			expect(findMemberByID).toHaveBeenCalledWith(memberID);
		});

		test('requires member read role', async () => {
			const onUnexpectedError = vi.fn();
			const findMemberByID = vi.fn(() => Promise.resolve(undefined));
			const authorize = vi.fn(() => Promise.resolve(false));
			const adapter = createMockAdapter({ onUnexpectedError, findMemberByID, authorize });
			const request = createGraphQLServer(adapter);

			const memberID = faker.string.uuid();
			const result = await request({
				document: gql(`
					query FindMember($id: ID!) {
						cohortMember(id: $id) {
							id
						}
					}
				`),
				variables: { id: memberID },
			});

			expect((result as any).errors).toHaveLength(1);
			expect((result as any).data.cohortMember).toBeNull();
			expect(authorize).toHaveBeenCalledWith({ userID: 'test' }, [adapter.permissions.member.read]);
		});
	});

	describe('cohortMembers', () => {
		describe('without query', () => {
			test('returns empty list when there are no members', async () => {
				const listMembers = vi.fn(() => Promise.resolve([]));
				const adapter = createMockAdapter({ listMembers });
				const request = createGraphQLServer(adapter);

				const result = await request({
					document: gql(`
						query {
							cohortMembers {
								items {
									id
								}
							}
						}
					`),
				});

				expect(result).toEqual({
					data: {
						cohortMembers: { items: [] },
					},
				});
				expect(listMembers).toHaveBeenCalledOnce();
			});

			test('returns list of all members', async () => {
				const members = [
					CohortMember.create({ id: faker.string.uuid() }),
					CohortMember.create({ id: faker.string.uuid() }),
					CohortMember.create({ id: faker.string.uuid() }),
				];
				const listMembers = vi.fn(() => Promise.resolve(members));
				const adapter = createMockAdapter({ listMembers });
				const request = createGraphQLServer(adapter);

				const result = await request({
					document: gql(`
						query {
							cohortMembers {
								items {
									id
								}
							}
						}
					`),
				});

				expect(result).toEqual({
					data: {
						cohortMembers: { items: members },
					},
				});
				expect(listMembers).toHaveBeenCalledOnce();
			});

			test('requires member read role', async () => {
				const authorize = vi.fn(() => Promise.resolve(false));
				const adapter = createMockAdapter({ authorize });
				const request = createGraphQLServer(adapter);

				const result = await request({
					document: gql(`
						query {
							cohortMembers {
								items {
									id
								}
							}
						}
					`),
				});

				expect((result as any).errors).toHaveLength(1);
				expect((result as any).data.cohortMembers).toBeNull();
				expect(authorize).toHaveBeenCalledWith({ userID: 'test' }, [
					adapter.permissions.member.read,
				]);
			});
		});

		describe('with search query', () => {
			test('returns empty list when there are no results', async () => {
				const searchMembers = vi.fn(() => Promise.resolve([]));
				const adapter = createMockAdapter({ searchMembers });
				const request = createGraphQLServer(adapter);

				const result = await request({
					document: gql(`
						query {
							cohortMembers(query: "abc123") {
								items {
									id
								}
							}
						}
					`),
				});

				expect(result).toEqual({
					data: {
						cohortMembers: { items: [] },
					},
				});
				expect(searchMembers).toHaveBeenCalledOnce();
				expect(searchMembers).toHaveBeenCalledWith('abc123');
			});

			test('returns list of all members that match query', async () => {
				const members = [
					CohortMember.create({ id: faker.string.uuid() }),
					CohortMember.create({ id: faker.string.uuid() }),
					CohortMember.create({ id: faker.string.uuid() }),
				];
				const searchMembers = vi.fn(() => Promise.resolve(members));
				const adapter = createMockAdapter({ searchMembers });
				const request = createGraphQLServer(adapter);

				const result = await request({
					document: gql(`
						query {
							cohortMembers(query: "abc123") {
								items {
									id
								}
							}
						}
					`),
				});

				expect(result).toEqual({
					data: {
						cohortMembers: { items: members },
					},
				});
				expect(searchMembers).toHaveBeenCalledOnce();
				expect(searchMembers).toHaveBeenCalledWith('abc123');
			});

			test('requires member read role', async () => {
				const authorize = vi.fn(() => Promise.resolve(false));
				const adapter = createMockAdapter({ authorize });
				const request = createGraphQLServer(adapter);

				const result = await request({
					document: gql(`
						query {
							cohortMembers(query: "abc123") {
								items {
									id
								}
							}
						}
					`),
				});

				expect((result as any).errors).toHaveLength(1);
				expect((result as any).data.cohortMembers).toBeNull();
				expect(authorize).toHaveBeenCalledWith({ userID: 'test' }, [
					adapter.permissions.member.read,
				]);
			});
		});
	});

	describe('cohortRoles', () => {
		test('returns list of all roles', async () => {
			const roles = [fakeRole(), fakeRole(), fakeRole()];
			const listRoles = vi.fn(() => Promise.resolve(roles));
			const adapter = createMockAdapter({ listRoles });
			const request = createGraphQLServer(adapter);

			const result = await request({
				document: gql(`
					query {
						cohortRoles {
							items {
								id
								... on TestRole {
									name
									description
								}
							}
						}
					}
				`),
			});

			expect(result).toEqual({
				data: {
					cohortRoles: { items: roles },
				},
			});
			expect(listRoles).toHaveBeenCalledOnce();
		});

		test("requires 'role read' role", async () => {
			const authorize = vi.fn(() => Promise.resolve(false));
			const adapter = createMockAdapter({ authorize });
			const request = createGraphQLServer(adapter);

			const result = await request({
				document: gql(`
					query {
						cohortRoles {
							items {
								id
							}
						}
					}
				`),
			});

			expect((result as any).errors).toHaveLength(1);
			expect((result as any).data.cohortRoles).toBeNull();
			expect(authorize).toHaveBeenCalledWith({ userID: 'test' }, [adapter.permissions.role.read]);
		});
	});
});

describe('Mutation', () => {
	describe('cohortInviteMember', () => {
		test('creates and attempts to send invite', async () => {
			const role = fakeRole();
			const invite = fakeInvite({ roleIDs: [role.id] });

			const findInviteByEmail = vi.fn(() => Promise.resolve(undefined));
			const findMemberByEmail = vi.fn(() => Promise.resolve(undefined));
			const findRoleByID = vi.fn(() => Promise.resolve(role));
			const createInvite = vi.fn(() => Promise.resolve(invite));
			const sendInvite = vi.fn(() => Promise.resolve());
			const adapter = createMockAdapter({
				findInviteByEmail,
				findMemberByEmail,
				findRoleByID,
				createInvite,
				sendInvite,
			});
			const request = createGraphQLServer(adapter);

			const newInvite = { email: invite.email, metadata: invite.metadata, roleIDs: invite.roleIDs };
			const result = await request({
				document: gql(`
					mutation SendInvite($input: CohortMemberInviteInput!) {
						cohortInviteMember(input: $input) {
							__typename
							... on CohortMemberInvite {
								id
								email
								roleIDs
							}
						}
					}
				`),
				variables: {
					input: newInvite,
				},
			});

			expect(result).toEqual({
				data: {
					cohortInviteMember: {
						__typename: 'CohortMemberInvite',
						id: invite.id,
						email: invite.email,
						roleIDs: invite.roleIDs,
					},
				},
			});
			expect(findInviteByEmail).toHaveBeenCalledWith(invite.email);
			expect(findMemberByEmail).toHaveBeenCalledWith(invite.email);
			expect(findRoleByID).toHaveBeenCalledWith(role.id);
			expect(createInvite).toHaveBeenCalledWith(newInvite);
			expect(sendInvite).toBeCalled();
		});

		test('returns graceful error when member is already invited', async () => {
			const invite = fakeInvite();

			const adapter = createMockAdapter({
				findInviteByEmail: async () => invite,
			});
			const request = createGraphQLServer(adapter);

			const result = await request({
				document: gql(`
					mutation SendInvite($input: CohortMemberInviteInput!) {
						cohortInviteMember(input: $input) {
							__typename
							... on CohortInviteMemberError {
								reason
								message
							}
						}
					}
				`),
				variables: { input: { email: invite.email, metadata: invite.metadata } },
			});

			expect(result).toEqual({
				data: {
					cohortInviteMember: {
						__typename: 'CohortInviteMemberError',
						reason: 'ALREADY_INVITED',
						message: `A member with the email \`${invite.email}\` has already been invited`,
					},
				},
			});
		});

		test('returns graceful error when member is already signed up', async () => {
			const email = faker.internet.exampleEmail();
			const member = CohortMember.create({
				id: faker.string.uuid(),
			});

			const adapter = createMockAdapter({
				findInviteByEmail: async () => undefined,
				findMemberByEmail: async () => member,
			});
			const request = createGraphQLServer(adapter);

			const result = await request({
				document: gql(`
					mutation SendInvite($input: CohortMemberInviteInput!) {
						cohortInviteMember(input: $input) {
							__typename
							... on CohortInviteMemberError {
								reason
								message
							}
						}
					}
				`),
				variables: { input: { email: email, metadata: {} } },
			});

			expect(result).toEqual({
				data: {
					cohortInviteMember: {
						__typename: 'CohortInviteMemberError',
						reason: 'ALREADY_MEMBER',
						message: `A member with the email \`${email}\` has already signed up`,
					},
				},
			});
		});

		test('returns graceful error when role is not found', async () => {
			const roleID = faker.string.uuid();
			const invite = fakeInvite({ roleIDs: [roleID] });

			const adapter = createMockAdapter({
				findRoleByID: async () => undefined,
				findInviteByEmail: async () => undefined,
				findMemberByEmail: async () => undefined,
			});
			const request = createGraphQLServer(adapter);

			const result = await request({
				document: gql(`
					mutation SendInvite($input: CohortMemberInviteInput!) {
						cohortInviteMember(input: $input) {
							__typename
							... on CohortInviteMemberError {
								reason
								message
							}
						}
					}
				`),
				variables: {
					input: { email: invite.email, metadata: invite.metadata, roleIDs: invite.roleIDs },
				},
			});

			expect(result).toEqual({
				data: {
					cohortInviteMember: {
						__typename: 'CohortInviteMemberError',
						reason: 'UNKNOWN_ROLE',
						message: `Role not found with ID \`${roleID}\``,
					},
				},
			});
		});

		test('handles unexpected errors', async () => {
			const email = faker.internet.exampleEmail();

			const onUnexpectedError = vi.fn();
			const adapter = createMockAdapter({
				onUnexpectedError,
				findInviteByEmail: () => Promise.reject(new Error('Injected error')),
			});
			const request = createGraphQLServer(adapter);

			const result = await request({
				document: gql(`
					mutation SendInvite($input: CohortMemberInviteInput!) {
						cohortInviteMember(input: $input) {
							__typename
							... on CohortInviteMemberError {
								reason
								message
							}
						}
					}
				`),
				variables: { input: { email: email, metadata: {} } },
			});

			expect(onUnexpectedError).toHaveBeenCalledOnce();
			expect(result).toEqual({
				data: {
					cohortInviteMember: {
						__typename: 'CohortInviteMemberError',
						reason: 'UNEXPECTED',
						message: 'An unexpected error occurred',
					},
				},
			});
		});

		test('requires invite create role', async () => {
			const onUnexpectedError = vi.fn();
			const authorize = vi.fn(() => Promise.resolve(false));
			const adapter = createMockAdapter({
				onUnexpectedError,
				authorize,
			});
			const request = createGraphQLServer(adapter);

			const result = await request({
				document: gql(`
					mutation SendInvite($input: CohortMemberInviteInput!) {
						cohortInviteMember(input: $input) {
							__typename
							... on CohortInviteMemberError {
								reason
								message
							}
						}
					}
				`),
				variables: { input: { email: faker.internet.exampleEmail(), metadata: {} } },
			});

			expect(onUnexpectedError).toHaveBeenCalledOnce();
			expect(result).toEqual({
				data: {
					cohortInviteMember: {
						__typename: 'CohortInviteMemberError',
						reason: 'UNEXPECTED',
						message: `Missing permission(s) ${adapter.permissions.invite.create}`,
					},
				},
			});
			expect(authorize).toHaveBeenCalledWith({ userID: 'test' }, [
				adapter.permissions.invite.create,
			]);
		});
	});

	describe('cohortRevokeMemberInvite', () => {
		test('attempts to revoke the invite', async () => {
			const invites = [fakeInvite(), fakeInvite(), fakeInvite()];
			const findInviteByID = vi.fn((id) =>
				Promise.resolve(invites.find((invite) => invite.id === id)),
			);
			const revokeInvite = vi.fn();
			const adapter = createMockAdapter({ findInviteByID, revokeInvite });
			const request = createGraphQLServer(adapter);

			const result = await request({
				document: gql(`
					mutation RevokeInvite($inviteID: ID!) {
						cohortRevokeMemberInvite(inviteID: $inviteID) {
							__typename
							... on CohortMemberInvite {
								id
								email
							}
						}
					}
				`),
				variables: { inviteID: invites[1].id },
			});

			expect(result).toEqual({
				data: {
					cohortRevokeMemberInvite: {
						__typename: 'CohortMemberInvite',
						id: invites[1].id,
						email: invites[1].email,
					},
				},
			});
			expect(findInviteByID).toHaveBeenCalledOnce();
			expect(findInviteByID).toHaveBeenCalledWith(invites[1].id);
			expect(revokeInvite).toHaveBeenCalledOnce();
			expect(revokeInvite).toHaveBeenCalledWith(invites[1]);
		});

		test('handles unexpected errors', async () => {
			const onUnexpectedError = vi.fn();
			const adapter = createMockAdapter({
				onUnexpectedError,
				findInviteByID: () => Promise.reject(new Error('Injected error')),
			});
			const request = createGraphQLServer(adapter);

			const result = await request({
				document: gql(`
					mutation RevokeInvite($inviteID: ID!) {
						cohortRevokeMemberInvite(inviteID: $inviteID) {
							__typename
							... on CohortRevokeMemberInviteError {
								reason
								message
							}
						}
					}
				`),
				variables: { inviteID: faker.string.uuid() },
			});

			expect(onUnexpectedError).toHaveBeenCalledOnce();
			expect(result).toEqual({
				data: {
					cohortRevokeMemberInvite: {
						__typename: 'CohortRevokeMemberInviteError',
						reason: 'UNEXPECTED',
						message: 'An unexpected error occurred',
					},
				},
			});
		});

		test('handles invite not found error', async () => {
			const adapter = createMockAdapter({
				findInviteByID: () => Promise.resolve(undefined),
			});
			const request = createGraphQLServer(adapter);

			const inviteID = faker.string.uuid();
			const result = await request({
				document: gql(`
					mutation RevokeInvite($inviteID: ID!) {
						cohortRevokeMemberInvite(inviteID: $inviteID) {
							__typename
							... on CohortRevokeMemberInviteError {
								reason
								message
							}
						}
					}
				`),
				variables: { inviteID },
			});

			expect(result).toEqual({
				data: {
					cohortRevokeMemberInvite: {
						__typename: 'CohortRevokeMemberInviteError',
						reason: 'INVITE_NOT_FOUND',
						message: `Member invite with ID \`${inviteID}\` could not be found to revoke`,
					},
				},
			});
		});

		test('requires invite delete role', async () => {
			const onUnexpectedError = vi.fn();
			const authorize = vi.fn(() => Promise.resolve(false));
			const adapter = createMockAdapter({
				onUnexpectedError,
				authorize,
			});
			const request = createGraphQLServer(adapter);

			const inviteID = faker.string.uuid();
			const result = await request({
				document: gql(`
					mutation RevokeInvite($inviteID: ID!) {
						cohortRevokeMemberInvite(inviteID: $inviteID) {
							__typename
							... on CohortRevokeMemberInviteError {
								reason
								message
							}
						}
					}
				`),
				variables: { inviteID },
			});

			expect(result).toEqual({
				data: {
					cohortRevokeMemberInvite: {
						__typename: 'CohortRevokeMemberInviteError',
						reason: 'UNEXPECTED',
						message: `Missing permission(s) ${adapter.permissions.invite.delete}`,
					},
				},
			});
			expect(authorize).toHaveBeenCalledWith({ userID: 'test' }, [
				adapter.permissions.invite.delete,
			]);
		});
	});

	describe('cohortRedeemMemberInvite', () => {
		test('redeems the invite', async () => {
			const invite = fakeInvite();
			const newMember = CohortMember.create({ id: faker.string.uuid() });
			const findInviteByID = vi.fn(async () => invite);
			const redeemInvite = vi.fn(async () => newMember);
			const adapter = createMockAdapter({ findInviteByID, redeemInvite });
			const request = createGraphQLServer(adapter);

			const result = await request({
				document: gql(`
					mutation RedeemInvite($inviteID: ID!) {
						cohortRedeemMemberInvite(inviteID: $inviteID) {
							__typename
							... on CohortRedeemMemberInvite {
								member {
									id
								}
							}
						}
					}
				`),
				variables: { inviteID: invite.id },
			});

			expect(result).toEqual({
				data: {
					cohortRedeemMemberInvite: {
						__typename: 'CohortRedeemMemberInvite',
						member: {
							id: newMember.id,
						},
					},
				},
			});
			expect(findInviteByID).toHaveBeenCalledWith(invite.id);
			expect(redeemInvite).toHaveBeenCalled();
		});

		test('handles unexpected errors', async () => {
			const onUnexpectedError = vi.fn();
			const adapter = createMockAdapter({
				onUnexpectedError,
				findInviteByID: () => Promise.reject(new Error('Injected error')),
			});
			const request = createGraphQLServer(adapter);

			const result = await request({
				document: gql(`
					mutation RedeemInvite($inviteID: ID!) {
						cohortRedeemMemberInvite(inviteID: $inviteID) {
							__typename
							... on CohortRedeemMemberInviteError {
								reason
								message
							}
						}
					}
				`),
				variables: { inviteID: faker.string.uuid() },
			});

			expect(onUnexpectedError).toHaveBeenCalledOnce();
			expect(result).toEqual({
				data: {
					cohortRedeemMemberInvite: {
						__typename: 'CohortRedeemMemberInviteError',
						reason: 'UNEXPECTED',
						message: 'An unexpected error occurred',
					},
				},
			});
		});

		test('handles invite not found error', async () => {
			const adapter = createMockAdapter({
				findInviteByID: () => Promise.resolve(undefined),
			});
			const request = createGraphQLServer(adapter);

			const inviteID = faker.string.uuid();
			const result = await request({
				document: gql(`
					mutation RedeemInvite($inviteID: ID!) {
						cohortRedeemMemberInvite(inviteID: $inviteID) {
							__typename
							... on CohortRedeemMemberInviteError {
								reason
								message
							}
						}
					}
				`),
				variables: { inviteID },
			});

			expect(result).toEqual({
				data: {
					cohortRedeemMemberInvite: {
						__typename: 'CohortRedeemMemberInviteError',
						reason: 'INVITE_NOT_FOUND',
						message: `Member invite with ID \`${inviteID}\` could not be found to redeem`,
					},
				},
			});
		});
	});

	describe('cohortResendMemberInvite', () => {
		test('attempts to resend the invite', async () => {
			const invite = fakeInvite();
			const findInviteByID = vi.fn(async () => invite);
			const sendInvite = vi.fn();
			const adapter = createMockAdapter({ findInviteByID, sendInvite });
			const request = createGraphQLServer(adapter);

			const result = await request({
				document: gql(`
					mutation ResendInvite($inviteID: ID!) {
						cohortResendMemberInvite(inviteID: $inviteID) {
							__typename
							... on CohortMemberInvite {
								id
							}
						}
					}
				`),
				variables: { inviteID: invite.id },
			});

			expect(result).toEqual({
				data: {
					cohortResendMemberInvite: {
						__typename: 'CohortMemberInvite',
						id: invite.id,
					},
				},
			});
			expect(findInviteByID).toHaveBeenCalledWith(invite.id);
			expect(sendInvite).toHaveBeenNthCalledWith(1, invite);
		});

		test('handles unexpected errors', async () => {
			const onUnexpectedError = vi.fn();
			const adapter = createMockAdapter({
				onUnexpectedError,
				findInviteByID: () => Promise.reject(new Error('Injected error')),
			});
			const request = createGraphQLServer(adapter);

			const result = await request({
				document: gql(`
					mutation ResendInvite($inviteID: ID!) {
						cohortResendMemberInvite(inviteID: $inviteID) {
							__typename
							... on CohortResendMemberInviteError {
								reason
								message
							}
						}
					}
				`),
				variables: { inviteID: faker.string.uuid() },
			});

			expect(onUnexpectedError).toHaveBeenCalledOnce();
			expect(result).toEqual({
				data: {
					cohortResendMemberInvite: {
						__typename: 'CohortResendMemberInviteError',
						reason: 'UNEXPECTED',
						message: 'An unexpected error occurred',
					},
				},
			});
		});

		test('handles invite not found error', async () => {
			const adapter = createMockAdapter({
				findInviteByID: () => Promise.resolve(undefined),
			});
			const request = createGraphQLServer(adapter);

			const inviteID = faker.string.uuid();
			const result = await request({
				document: gql(`
					mutation ResendInvite($inviteID: ID!) {
						cohortResendMemberInvite(inviteID: $inviteID) {
							__typename
							... on CohortResendMemberInviteError {
								reason
								message
							}
						}
					}
				`),
				variables: { inviteID },
			});

			expect(result).toEqual({
				data: {
					cohortResendMemberInvite: {
						__typename: 'CohortResendMemberInviteError',
						reason: 'INVITE_NOT_FOUND',
						message: `Member invite with ID \`${inviteID}\` could not be found to resend`,
					},
				},
			});
		});
	});

	describe('cohortMemberAddRole', () => {
		test('requires "role assign" role', async () => {
			const onUnexpectedError = vi.fn();
			const authorize = vi.fn(() => Promise.resolve(false));
			const adapter = createMockAdapter({
				onUnexpectedError,
				authorize,
			});
			const request = createGraphQLServer(adapter);

			const memberID = faker.string.uuid();
			const result = await request({
				document: gql(`
					mutation AddRole($memberID: ID!, $roleID: ID!) {
						cohortMemberAddRole(memberID: $memberID, roleID: $roleID) {
							__typename
							... on CohortMemberRoleChangeError {
								reason
								message
							}
						}
					}
				`),
				variables: { memberID, roleID: faker.string.uuid() },
			});

			expect(result).toEqual({
				data: {
					cohortMemberAddRole: {
						__typename: 'CohortMemberRoleChangeError',
						reason: 'UNEXPECTED',
						message: `Missing permission(s) ${adapter.permissions.role.assign}`,
					},
				},
			});
			expect(authorize).toHaveBeenCalledWith({ userID: 'test' }, [adapter.permissions.role.assign]);
		});

		test('handles member not found error', async () => {
			const role = fakeRole();
			const adapter = createMockAdapter({
				findRoleByID: () => Promise.resolve(role),
				findMemberByID: () => Promise.resolve(undefined),
			});
			const request = createGraphQLServer(adapter);

			const memberID = faker.string.uuid();
			const result = await request({
				document: gql(`
					mutation AddRole($memberID: ID!, $roleID: ID!) {
						cohortMemberAddRole(memberID: $memberID, roleID: $roleID) {
							__typename
							... on CohortMemberRoleChangeError {
								reason
								message
							}
						}
					}
				`),
				variables: { memberID, roleID: role.id },
			});

			expect(result).toEqual({
				data: {
					cohortMemberAddRole: {
						__typename: 'CohortMemberRoleChangeError',
						reason: 'MEMBER_NOT_FOUND',
						message: `A member with the ID \`${memberID}\` could not be found`,
					},
				},
			});
		});

		test('handles unknown role', async () => {
			const adapter = createMockAdapter({
				findRoleByID: () => Promise.resolve(undefined),
			});
			const request = createGraphQLServer(adapter);

			const roleID = faker.string.uuid();
			const result = await request({
				document: gql(`
					mutation AddRole($memberID: ID!, $roleID: ID!) {
						cohortMemberAddRole(memberID: $memberID, roleID: $roleID) {
							__typename
							... on CohortMemberRoleChangeError {
								reason
								message
							}
						}
					}
				`),
				variables: { memberID: faker.string.uuid(), roleID },
			});

			expect(result).toEqual({
				data: {
					cohortMemberAddRole: {
						__typename: 'CohortMemberRoleChangeError',
						reason: 'UNKNOWN_ROLE',
						message: `Role not found with ID \`${roleID}\``,
					},
				},
			});
		});

		test('returns updated roles list', async () => {
			const role = fakeRole();
			const findRoleByID = vi.fn(() => Promise.resolve(role));
			const assignRole = vi.fn(() => Promise.resolve(undefined));
			const member = CohortMember.create({
				id: faker.string.uuid(),
			});
			const adapter = createMockAdapter({
				assignRole,
				findRoleByID,
				findMemberByID: () => Promise.resolve(member),
			});
			const request = createGraphQLServer(adapter);

			const result = await request({
				document: gql(`
					mutation AddRole($memberID: ID!, $roleID: ID!) {
						cohortMemberAddRole(memberID: $memberID, roleID: $roleID) {
							__typename
							... on CohortMemberRoleChange {
								memberID
							}
						}
					}
				`),
				variables: { memberID: member.id, roleID: role.id },
			});

			expect(result).toEqual({
				data: {
					cohortMemberAddRole: {
						__typename: 'CohortMemberRoleChange',
						memberID: member.id,
					},
				},
			});
			expect(findRoleByID).toHaveBeenCalledWith(role.id);
			expect(assignRole).toHaveBeenCalledWith(member, role);
		});
	});

	describe('cohortMemberRemoveRole', () => {
		test('requires "role assign" role', async () => {
			const onUnexpectedError = vi.fn();
			const authorize = vi.fn(() => Promise.resolve(false));
			const adapter = createMockAdapter({
				onUnexpectedError,
				authorize,
			});
			const request = createGraphQLServer(adapter);

			const memberID = faker.string.uuid();
			const result = await request({
				document: gql(`
					mutation RemoveRole($memberID: ID!, $roleID: ID!) {
						cohortMemberRemoveRole(memberID: $memberID, roleID: $roleID) {
							__typename
							... on CohortMemberRoleChangeError {
								reason
								message
							}
						}
					}
				`),
				variables: { memberID, roleID: faker.string.uuid() },
			});

			expect(result).toEqual({
				data: {
					cohortMemberRemoveRole: {
						__typename: 'CohortMemberRoleChangeError',
						reason: 'UNEXPECTED',
						message: `Missing permission(s) ${adapter.permissions.role.assign}`,
					},
				},
			});
			expect(authorize).toHaveBeenCalledWith({ userID: 'test' }, [adapter.permissions.role.assign]);
		});

		test('handles member not found error', async () => {
			const role = fakeRole();
			const adapter = createMockAdapter({
				findRoleByID: () => Promise.resolve(role),
				findMemberByID: () => Promise.resolve(undefined),
			});
			const request = createGraphQLServer(adapter);

			const memberID = faker.string.uuid();
			const result = await request({
				document: gql(`
					mutation RemoveRole($memberID: ID!, $roleID: ID!) {
						cohortMemberRemoveRole(memberID: $memberID, roleID: $roleID) {
							__typename
							... on CohortMemberRoleChangeError {
								reason
								message
							}
						}
					}
				`),
				variables: { memberID, roleID: role.id },
			});

			expect(result).toEqual({
				data: {
					cohortMemberRemoveRole: {
						__typename: 'CohortMemberRoleChangeError',
						reason: 'MEMBER_NOT_FOUND',
						message: `A member with the ID \`${memberID}\` could not be found`,
					},
				},
			});
		});

		test('handles unknown role', async () => {
			const adapter = createMockAdapter({
				findRoleByID: () => Promise.resolve(undefined),
			});
			const request = createGraphQLServer(adapter);

			const role = faker.string.uuid();
			const result = await request({
				document: gql(`
					mutation RemoveRole($memberID: ID!, $roleID: ID!) {
						cohortMemberRemoveRole(memberID: $memberID, roleID: $roleID) {
							__typename
							... on CohortMemberRoleChangeError {
								reason
								message
							}
						}
					}
				`),
				variables: { memberID: faker.string.uuid(), roleID: role },
			});

			expect(result).toEqual({
				data: {
					cohortMemberRemoveRole: {
						__typename: 'CohortMemberRoleChangeError',
						reason: 'UNKNOWN_ROLE',
						message: `Role not found with ID \`${role}\``,
					},
				},
			});
		});

		test('returns updated roles list', async () => {
			const role = fakeRole();
			const findRoleByID = vi.fn(() => Promise.resolve(role));
			const unassignRole = vi.fn(() => Promise.resolve(undefined));
			const member = CohortMember.create({
				id: faker.string.uuid(),
			});
			const adapter = createMockAdapter({
				unassignRole,
				findRoleByID,
				findMemberByID: () => Promise.resolve(member),
			});
			const request = createGraphQLServer(adapter);

			const result = await request({
				document: gql(`
					mutation RemoveRole($memberID: ID!, $roleID: ID!) {
						cohortMemberRemoveRole(memberID: $memberID, roleID: $roleID) {
							__typename
							... on CohortMemberRoleChange {
								memberID
							}
						}
					}
				`),
				variables: { memberID: member.id, roleID: role.id },
			});

			expect(result).toEqual({
				data: {
					cohortMemberRemoveRole: {
						__typename: 'CohortMemberRoleChange',
						memberID: member.id,
					},
				},
			});
			expect(findRoleByID).toHaveBeenCalledWith(role.id);
			expect(unassignRole).toHaveBeenCalledWith(member, role);
		});
	});

	describe('cohortMemberDelete', () => {
		test('requires member delete role', async () => {
			const onUnexpectedError = vi.fn();
			const authorize = vi.fn(() => Promise.resolve(false));
			const adapter = createMockAdapter({
				onUnexpectedError,
				authorize,
			});
			const request = createGraphQLServer(adapter);

			const memberID = faker.string.uuid();
			const result = await request({
				document: gql(`
					mutation DeleteMember($memberID: ID!) {
						cohortDeleteMember(memberID: $memberID) {
							__typename
							... on CohortMemberDeleteError {
								reason
								message
							}
						}
					}
				`),
				variables: { memberID },
			});

			expect(result).toEqual({
				data: {
					cohortDeleteMember: {
						__typename: 'CohortMemberDeleteError',
						reason: 'UNEXPECTED',
						message: `Missing permission(s) ${adapter.permissions.member.delete}`,
					},
				},
			});
			expect(authorize).toHaveBeenCalledWith({ userID: 'test' }, [
				adapter.permissions.member.delete,
			]);
		});

		test('handles member not found error', async () => {
			const adapter = createMockAdapter({
				findMemberByID: async () => undefined,
			});
			const request = createGraphQLServer(adapter);

			const memberID = faker.string.uuid();
			const result = await request({
				document: gql(`
					mutation DeleteMember($memberID: ID!) {
						cohortDeleteMember(memberID: $memberID) {
							__typename
							... on CohortMemberDeleteError {
								reason
								message
							}
						}
					}
				`),
				variables: { memberID },
			});

			expect(result).toEqual({
				data: {
					cohortDeleteMember: {
						__typename: 'CohortMemberDeleteError',
						reason: 'MEMBER_NOT_FOUND',
						message: `A member with the ID \`${memberID}\` could not be found`,
					},
				},
			});
		});

		test('tries to delete the member', async () => {
			const member = fakeMember();
			const deleteMember = vi.fn();
			const adapter = createMockAdapter({
				findMemberByID: async () => member,
				deleteMember,
			});
			const request = createGraphQLServer(adapter);

			const result = await request({
				document: gql(`
					mutation DeleteMember($memberID: ID!) {
						cohortDeleteMember(memberID: $memberID) {
							__typename
							... on CohortMemberDelete {
								member { id }
							}
						}
					}
				`),
				variables: { memberID: member.id },
			});

			expect(result).toEqual({
				data: {
					cohortDeleteMember: {
						__typename: 'CohortMemberDelete',
						member: {
							id: member.id,
						},
					},
				},
			});
			expect(deleteMember).toHaveBeenCalledWith(member);
		});
	});
});

function fakeInvite(fields: Partial<PlainInvite> = {}) {
	return Invite.create({
		id: faker.string.uuid(),
		email: faker.internet.exampleEmail(),
		metadata: {},
		roleIDs: [],
		...fields,
	});
}

function fakeRole() {
	return {
		id: faker.string.uuid(),
		name: faker.lorem.word(),
		description: faker.lorem.sentence(),
	};
}

function fakeMember() {
	return CohortMember.create({ id: faker.string.uuid() });
}
