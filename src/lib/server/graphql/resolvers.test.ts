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

type AuthContext = { userID: string; scopes: string[] };
function createMockAdapter(mocks: Partial<CohortAdapter<AuthContext>>): CohortAdapter<AuthContext> {
	const abort = (name: string) => () => {
		throw new Error(`\`${name}\` was not expected to be called in this test`);
	};
	return {
		onUnexpectedError: mocks.onUnexpectedError ?? abort('onUnexpectedError'),
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
		authenticate: mocks.authenticate ?? (() => Promise.resolve({ userID: 'test', scopes: [] })),
		authorize: mocks.authorize ?? (() => Promise.resolve(true)),
	};
}

const testSchema = /* GraphQL */ `
	type TestMember implements CohortMember {
		id: ID!
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

		test("requires 'cohort:invite:read'", async () => {
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
			expect(authorize).toHaveBeenCalledWith({ userID: 'test', scopes: [] }, [
				'cohort:invite:read',
			]);
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
			const invites = [
				Invite.create({
					id: faker.string.uuid(),
					email: faker.internet.exampleEmail(),
					metadata: {},
				}),
				Invite.create({
					id: faker.string.uuid(),
					email: faker.internet.exampleEmail(),
					metadata: {},
				}),
				Invite.create({
					id: faker.string.uuid(),
					email: faker.internet.exampleEmail(),
					metadata: {},
				}),
			];
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

		test("requires 'cohort:invite:read'", async () => {
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
			expect(authorize).toHaveBeenCalledWith({ userID: 'test', scopes: [] }, [
				'cohort:invite:read',
			]);
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

		test("requires 'cohort:member:read'", async () => {
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
			expect(authorize).toHaveBeenCalledWith({ userID: 'test', scopes: [] }, [
				'cohort:member:read',
			]);
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

			test("requires 'cohort:member:read'", async () => {
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
				expect(authorize).toHaveBeenCalledWith({ userID: 'test', scopes: [] }, [
					'cohort:member:read',
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

			test("requires 'cohort:member:read'", async () => {
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
				expect(authorize).toHaveBeenCalledWith({ userID: 'test', scopes: [] }, [
					'cohort:member:read',
				]);
			});
		});
	});
});

describe('Mutation', () => {
	describe('cohortInviteMember', () => {
		test('creates and attempts to send invite', async () => {
			const newInvite = {
				email: faker.internet.exampleEmail(),
				metadata: {},
			};
			const createdInvite = Invite.create({
				id: faker.string.uuid(),
				email: newInvite.email,
				metadata: newInvite.metadata,
			});

			const findInviteByEmail = vi.fn(() => Promise.resolve(undefined));
			const findMemberByEmail = vi.fn(() => Promise.resolve(undefined));
			const createInvite = vi.fn(() => Promise.resolve(createdInvite));
			const sendInvite = vi.fn(() => Promise.resolve());
			const adapter = createMockAdapter({
				findInviteByEmail,
				findMemberByEmail,
				createInvite,
				sendInvite,
			});
			const request = createGraphQLServer(adapter);

			const result = await request({
				document: gql(`
					mutation SendInvite($input: CohortMemberInviteInput!) {
						cohortInviteMember(input: $input) {
							__typename
							... on CohortMemberInvite {
								id
								email
							}
						}
					}
				`),
				variables: { input: newInvite },
			});

			expect(result).toEqual({
				data: {
					cohortInviteMember: {
						__typename: 'CohortMemberInvite',
						id: createdInvite.id,
						email: newInvite.email,
					},
				},
			});
			expect(findInviteByEmail).toHaveBeenCalledWith(newInvite.email);
			expect(findMemberByEmail).toHaveBeenCalledWith(newInvite.email);
			expect(createInvite).toHaveBeenCalledWith(newInvite.email, newInvite.metadata);
			expect(sendInvite).toHaveBeenCalledWith(createdInvite);
		});

		test('returns graceful error when member is already invited', async () => {
			const invite = Invite.create({
				id: faker.string.uuid(),
				email: faker.internet.exampleEmail(),
				metadata: {},
			});

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

		test("requires 'cohort:invite:create'", async () => {
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
						message: 'An unexpected error occurred',
					},
				},
			});
			expect(authorize).toHaveBeenCalledWith({ userID: 'test', scopes: [] }, [
				'cohort:invite:create',
			]);
		});
	});

	describe('cohortRevokeMemberInvite', () => {
		test('attempts to revoke the invite', async () => {
			const invites = [
				Invite.create({
					id: faker.string.uuid(),
					email: faker.internet.exampleEmail(),
					metadata: {},
				}),
				Invite.create({
					id: faker.string.uuid(),
					email: faker.internet.exampleEmail(),
					metadata: {},
				}),
				Invite.create({
					id: faker.string.uuid(),
					email: faker.internet.exampleEmail(),
					metadata: {},
				}),
			];
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

		test("requires 'cohort:invite:delete'", async () => {
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
						message: 'An unexpected error occurred',
					},
				},
			});
			expect(authorize).toHaveBeenCalledWith({ userID: 'test', scopes: [] }, [
				'cohort:invite:delete',
			]);
		});
	});
});
