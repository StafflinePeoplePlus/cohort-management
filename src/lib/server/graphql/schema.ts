export default `scalar EmailAddress

type Mutation {
	"""
	Invite a new member by email address
	"""
	cohortInviteMember(input: CohortMemberInviteInput!): CohortMemberInviteResult!

	"""
	Revoke a pending member invite. This action will prevent the invite from being accepted, but it
	will not rescind the email if it has already been sent. The email may still be delivered even
	after revocation.
	"""
	cohortRevokeMemberInvite(inviteID: ID!): CohortRevokeMemberInviteResult!

	"""
	Add role to the given member.
	"""
	cohortMemberAddRole(memberID: ID!, roleID: ID!): CohortMemberRoleChangeResult!

	"""
	Remove role from the given member.
	"""
	cohortMemberRemoveRole(memberID: ID!, roleID: ID!): CohortMemberRoleChangeResult!
}

type Query {
	cohortMemberInvitesCount: Int
	cohortMemberInvites: CohortMemberInviteList

	"""
	Search for cohort members or list all members if no query is provided
	"""
	cohortMembers(query: String): CohortMemberList

	"""
	Get a single cohort member by ID
	"""
	cohortMember(id: ID!): CohortMember

	"""
	List all roles that can be assigned to members
	"""
	cohortRoles: CohortRoleList
}

input CohortMemberInviteInput {
	"""
	Email address of the member to send the invitation to
	"""
	email: EmailAddress!

	"""
	IDs of any roles the invited member should be assigned when they accept the invite
	"""
	roleIDs: [ID!]

	"""
	Metadata to be associated with the invited member once accepted
	"""
	metadata: CohortMemberMetadataInput!
}

union CohortMemberInviteResult = CohortMemberInvite | CohortInviteMemberError
type CohortMemberInvite {
	id: ID!
	email: EmailAddress!
	metadata: CohortMemberMetadata!
	roleIDs: [ID!]!
}
type CohortInviteMemberError {
	"""
	Reason why the invite was not created
	"""
	reason: CohortInviteMemberErrorReason!

	"""
	Message possibly elaborating on the reason
	"""
	message: String!
}

"""
Reason why the invite creation failed
"""
enum CohortInviteMemberErrorReason {
	"""
	There is already a pending invite for given email
	"""
	ALREADY_INVITED

	"""
	There is already a member signed up with given email
	"""
	ALREADY_MEMBER

	"""
	One or more of the role IDs are invalid
	"""
	UNKNOWN_ROLE

	"""
	An unexpected error occurred
	"""
	UNEXPECTED
}

type CohortMemberInviteList {
	items: [CohortMemberInvite!]!
}

union CohortRevokeMemberInviteResult = CohortMemberInvite | CohortRevokeMemberInviteError
type CohortRevokeMemberInviteError {
	"""
	Reason why the invite was not revoked
	"""
	reason: CohortRevokeMemberInviteErrorReason!

	"""
	Message possibly elaborating on the reason
	"""
	message: String!
}

"""
Reason why the invite was not revoked
"""
enum CohortRevokeMemberInviteErrorReason {
	"""
	Invite with given ID was not found. This could mean that the invite was already accepted,
	already revoked, or never existed in the first place.
	"""
	INVITE_NOT_FOUND

	"""
	An unexpected error occurred
	"""
	UNEXPECTED
}

type CohortMemberList {
	items: [CohortMember!]!
}
interface CohortMember {
	id: ID!
}

union CohortMemberRoleChangeResult = CohortMemberRoleChange | CohortMemberRoleChangeError
type CohortMemberRoleChange {
	"""
	ID of the member the role change was applied to
	"""
	memberID: ID!

	"""
	Details of the role that was added or removed
	"""
	role: CohortRole!
}
type CohortMemberRoleChangeError {
	"""
	Reason why the role change failed
	"""
	reason: CohortMemberRoleChangeErrorReason!

	"""
	Message possibly elaborating on the reason
	"""
	message: String!
}
enum CohortMemberRoleChangeErrorReason {
	"""
	Member with given ID was not found
	"""
	MEMBER_NOT_FOUND

	"""
	Role not found with the given id
	"""
	UNKNOWN_ROLE

	"""
	An unexpected error occurred
	"""
	UNEXPECTED
}

interface CohortRole {
	id: ID!
}
type CohortRoleList {
	items: [CohortRole!]!
}
`;

export const defaults = `input CohortMemberMetadataInput {
	_: String
}
type CohortMemberMetadata {
	_: String
}
`;
