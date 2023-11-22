export default `scalar EmailAddress

type Mutation {
    """
    Invite a new member by email address
    """
    cohortInviteMember(
        input: CohortMemberInviteInput!
    ): CohortMemberInviteResult!
}

input CohortMemberInviteInput {
    """
    Email address of the member to send the invitation to
    """
    email: EmailAddress!

    """
    Metadata to be associated with the invited member once accepted
    """
    metadata: CohortMemberMetadataInput! # This should be defined by the consumer of the library
}

union CohortMemberInviteResult = CohortMemberInvite | CohortInviteMemberError
type CohortMemberInvite {
    """
    ID associated with the created invite
    """
    inviteID: ID!
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
`;
