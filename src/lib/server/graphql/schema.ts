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
}

input CohortMemberInviteInput {
	"""
	Email address of the member to send the invitation to
	"""
	email: EmailAddress!

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
`;

export const defaults = `input CohortMemberMetadataInput {
	_: String
}
type CohortMemberMetadata {
	_: String
}
`;
