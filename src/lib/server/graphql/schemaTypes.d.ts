/* eslint-disable */
import type { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  EmailAddress: { input: string; output: string; }
};

export type CohortInviteMemberError = {
  __typename?: 'CohortInviteMemberError';
  /** Message possibly elaborating on the reason */
  message: Scalars['String']['output'];
  /** Reason why the invite was not created */
  reason: CohortInviteMemberErrorReason;
};

/** Reason why the invite creation failed */
export type CohortInviteMemberErrorReason =
  /** There is already a pending invite for given email */
  | 'ALREADY_INVITED'
  /** There is already a member signed up with given email */
  | 'ALREADY_MEMBER'
  /** An unexpected error occurred */
  | 'UNEXPECTED';

export type CohortMember = {
  id: Scalars['ID']['output'];
};

export type CohortMemberInvite = {
  __typename?: 'CohortMemberInvite';
  email: Scalars['EmailAddress']['output'];
  id: Scalars['ID']['output'];
  metadata: CohortMemberMetadata;
};

export type CohortMemberInviteInput = {
  /** Email address of the member to send the invitation to */
  email: Scalars['EmailAddress']['input'];
  /** Metadata to be associated with the invited member once accepted */
  metadata: CohortMemberMetadataInput;
};

export type CohortMemberInviteList = {
  __typename?: 'CohortMemberInviteList';
  items: Array<CohortMemberInvite>;
};

export type CohortMemberInviteResult = CohortInviteMemberError | CohortMemberInvite;

export type CohortMemberList = {
  __typename?: 'CohortMemberList';
  items: Array<CohortMember>;
};

export type CohortMemberMetadata = CohortManagement.CohortMemberMetadata;

export type CohortMemberMetadataInput = CohortManagement.CohortMemberMetadataInput;

export type CohortMemberRoleChange = {
  __typename?: 'CohortMemberRoleChange';
  /** ID of the member the role change was applied to */
  memberID: Scalars['ID']['output'];
  /** Details of the role that was added or removed */
  role: CohortRole;
};

export type CohortMemberRoleChangeError = {
  __typename?: 'CohortMemberRoleChangeError';
  /** Message possibly elaborating on the reason */
  message: Scalars['String']['output'];
  /** Reason why the role change failed */
  reason: CohortMemberRoleChangeErrorReason;
};

export type CohortMemberRoleChangeErrorReason =
  /** Member with given ID was not found */
  | 'MEMBER_NOT_FOUND'
  /** An unexpected error occurred */
  | 'UNEXPECTED'
  /** Role not found with the given id */
  | 'UNKNOWN_ROLE';

export type CohortMemberRoleChangeResult = CohortMemberRoleChange | CohortMemberRoleChangeError;

export type CohortRevokeMemberInviteError = {
  __typename?: 'CohortRevokeMemberInviteError';
  /** Message possibly elaborating on the reason */
  message: Scalars['String']['output'];
  /** Reason why the invite was not revoked */
  reason: CohortRevokeMemberInviteErrorReason;
};

/** Reason why the invite was not revoked */
export type CohortRevokeMemberInviteErrorReason =
  /**
   * Invite with given ID was not found. This could mean that the invite was already accepted,
   * already revoked, or never existed in the first place.
   */
  | 'INVITE_NOT_FOUND'
  /** An unexpected error occurred */
  | 'UNEXPECTED';

export type CohortRevokeMemberInviteResult = CohortMemberInvite | CohortRevokeMemberInviteError;

export type CohortRole = {
  id: Scalars['ID']['output'];
};

export type CohortRoleList = {
  __typename?: 'CohortRoleList';
  items: Array<CohortRole>;
};

export type Mutation = {
  __typename?: 'Mutation';
  /** Invite a new member by email address */
  cohortInviteMember: CohortMemberInviteResult;
  /** Add role to the given member. */
  cohortMemberAddRole: CohortMemberRoleChangeResult;
  /** Remove role from the given member. */
  cohortMemberRemoveRole: CohortMemberRoleChangeResult;
  /**
   * Revoke a pending member invite. This action will prevent the invite from being accepted, but it
   * will not rescind the email if it has already been sent. The email may still be delivered even
   * after revocation.
   */
  cohortRevokeMemberInvite: CohortRevokeMemberInviteResult;
};


export type MutationCohortInviteMemberArgs = {
  input: CohortMemberInviteInput;
};


export type MutationCohortMemberAddRoleArgs = {
  memberID: Scalars['ID']['input'];
  roleID: Scalars['ID']['input'];
};


export type MutationCohortMemberRemoveRoleArgs = {
  memberID: Scalars['ID']['input'];
  roleID: Scalars['ID']['input'];
};


export type MutationCohortRevokeMemberInviteArgs = {
  inviteID: Scalars['ID']['input'];
};

export type Query = {
  __typename?: 'Query';
  /** Get a single cohort member by ID */
  cohortMember?: Maybe<CohortMember>;
  cohortMemberInvites?: Maybe<CohortMemberInviteList>;
  cohortMemberInvitesCount?: Maybe<Scalars['Int']['output']>;
  /** Search for cohort members or list all members if no query is provided */
  cohortMembers?: Maybe<CohortMemberList>;
  /** List all roles that can be assigned to members */
  cohortRoles?: Maybe<CohortRoleList>;
};


export type QueryCohortMemberArgs = {
  id: Scalars['ID']['input'];
};


export type QueryCohortMembersArgs = {
  query?: InputMaybe<Scalars['String']['input']>;
};



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping of union types */
export type ResolversUnionTypes<RefType extends Record<string, unknown>> = {
  CohortMemberInviteResult: ( CohortInviteMemberError ) | ( CohortMemberInvite );
  CohortMemberRoleChangeResult: ( CohortMemberRoleChange ) | ( CohortMemberRoleChangeError );
  CohortRevokeMemberInviteResult: ( CohortMemberInvite ) | ( CohortRevokeMemberInviteError );
};

/** Mapping of interface types */
export type ResolversInterfaceTypes<RefType extends Record<string, unknown>> = {
  CohortMember: never;
  CohortRole: never;
};

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  CohortInviteMemberError: ResolverTypeWrapper<CohortInviteMemberError>;
  CohortInviteMemberErrorReason: CohortInviteMemberErrorReason;
  CohortMember: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['CohortMember']>;
  CohortMemberInvite: ResolverTypeWrapper<CohortMemberInvite>;
  CohortMemberInviteInput: CohortMemberInviteInput;
  CohortMemberInviteList: ResolverTypeWrapper<CohortMemberInviteList>;
  CohortMemberInviteResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['CohortMemberInviteResult']>;
  CohortMemberList: ResolverTypeWrapper<CohortMemberList>;
  CohortMemberMetadata: ResolverTypeWrapper<CohortMemberMetadata>;
  CohortMemberMetadataInput: CohortMemberMetadataInput;
  CohortMemberRoleChange: ResolverTypeWrapper<CohortMemberRoleChange>;
  CohortMemberRoleChangeError: ResolverTypeWrapper<CohortMemberRoleChangeError>;
  CohortMemberRoleChangeErrorReason: CohortMemberRoleChangeErrorReason;
  CohortMemberRoleChangeResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['CohortMemberRoleChangeResult']>;
  CohortRevokeMemberInviteError: ResolverTypeWrapper<CohortRevokeMemberInviteError>;
  CohortRevokeMemberInviteErrorReason: CohortRevokeMemberInviteErrorReason;
  CohortRevokeMemberInviteResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['CohortRevokeMemberInviteResult']>;
  CohortRole: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['CohortRole']>;
  CohortRoleList: ResolverTypeWrapper<CohortRoleList>;
  EmailAddress: ResolverTypeWrapper<Scalars['EmailAddress']['output']>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  Mutation: ResolverTypeWrapper<{}>;
  Query: ResolverTypeWrapper<{}>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Boolean: Scalars['Boolean']['output'];
  CohortInviteMemberError: CohortInviteMemberError;
  CohortMember: ResolversInterfaceTypes<ResolversParentTypes>['CohortMember'];
  CohortMemberInvite: CohortMemberInvite;
  CohortMemberInviteInput: CohortMemberInviteInput;
  CohortMemberInviteList: CohortMemberInviteList;
  CohortMemberInviteResult: ResolversUnionTypes<ResolversParentTypes>['CohortMemberInviteResult'];
  CohortMemberList: CohortMemberList;
  CohortMemberMetadata: CohortMemberMetadata;
  CohortMemberMetadataInput: CohortMemberMetadataInput;
  CohortMemberRoleChange: CohortMemberRoleChange;
  CohortMemberRoleChangeError: CohortMemberRoleChangeError;
  CohortMemberRoleChangeResult: ResolversUnionTypes<ResolversParentTypes>['CohortMemberRoleChangeResult'];
  CohortRevokeMemberInviteError: CohortRevokeMemberInviteError;
  CohortRevokeMemberInviteResult: ResolversUnionTypes<ResolversParentTypes>['CohortRevokeMemberInviteResult'];
  CohortRole: ResolversInterfaceTypes<ResolversParentTypes>['CohortRole'];
  CohortRoleList: CohortRoleList;
  EmailAddress: Scalars['EmailAddress']['output'];
  ID: Scalars['ID']['output'];
  Int: Scalars['Int']['output'];
  Mutation: {};
  Query: {};
  String: Scalars['String']['output'];
};

export type CohortInviteMemberErrorResolvers<ContextType = any, ParentType extends ResolversParentTypes['CohortInviteMemberError'] = ResolversParentTypes['CohortInviteMemberError']> = {
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  reason?: Resolver<ResolversTypes['CohortInviteMemberErrorReason'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CohortMemberResolvers<ContextType = any, ParentType extends ResolversParentTypes['CohortMember'] = ResolversParentTypes['CohortMember']> = {
  __resolveType: TypeResolveFn<null, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
};

export type CohortMemberInviteResolvers<ContextType = any, ParentType extends ResolversParentTypes['CohortMemberInvite'] = ResolversParentTypes['CohortMemberInvite']> = {
  email?: Resolver<ResolversTypes['EmailAddress'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  metadata?: Resolver<ResolversTypes['CohortMemberMetadata'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CohortMemberInviteListResolvers<ContextType = any, ParentType extends ResolversParentTypes['CohortMemberInviteList'] = ResolversParentTypes['CohortMemberInviteList']> = {
  items?: Resolver<Array<ResolversTypes['CohortMemberInvite']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CohortMemberInviteResultResolvers<ContextType = any, ParentType extends ResolversParentTypes['CohortMemberInviteResult'] = ResolversParentTypes['CohortMemberInviteResult']> = {
  __resolveType: TypeResolveFn<'CohortInviteMemberError' | 'CohortMemberInvite', ParentType, ContextType>;
};

export type CohortMemberListResolvers<ContextType = any, ParentType extends ResolversParentTypes['CohortMemberList'] = ResolversParentTypes['CohortMemberList']> = {
  items?: Resolver<Array<ResolversTypes['CohortMember']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CohortMemberMetadataResolvers<ContextType = any, ParentType extends ResolversParentTypes['CohortMemberMetadata'] = ResolversParentTypes['CohortMemberMetadata']> = {
  _?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CohortMemberRoleChangeResolvers<ContextType = any, ParentType extends ResolversParentTypes['CohortMemberRoleChange'] = ResolversParentTypes['CohortMemberRoleChange']> = {
  memberID?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  role?: Resolver<ResolversTypes['CohortRole'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CohortMemberRoleChangeErrorResolvers<ContextType = any, ParentType extends ResolversParentTypes['CohortMemberRoleChangeError'] = ResolversParentTypes['CohortMemberRoleChangeError']> = {
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  reason?: Resolver<ResolversTypes['CohortMemberRoleChangeErrorReason'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CohortMemberRoleChangeResultResolvers<ContextType = any, ParentType extends ResolversParentTypes['CohortMemberRoleChangeResult'] = ResolversParentTypes['CohortMemberRoleChangeResult']> = {
  __resolveType: TypeResolveFn<'CohortMemberRoleChange' | 'CohortMemberRoleChangeError', ParentType, ContextType>;
};

export type CohortRevokeMemberInviteErrorResolvers<ContextType = any, ParentType extends ResolversParentTypes['CohortRevokeMemberInviteError'] = ResolversParentTypes['CohortRevokeMemberInviteError']> = {
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  reason?: Resolver<ResolversTypes['CohortRevokeMemberInviteErrorReason'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CohortRevokeMemberInviteResultResolvers<ContextType = any, ParentType extends ResolversParentTypes['CohortRevokeMemberInviteResult'] = ResolversParentTypes['CohortRevokeMemberInviteResult']> = {
  __resolveType: TypeResolveFn<'CohortMemberInvite' | 'CohortRevokeMemberInviteError', ParentType, ContextType>;
};

export type CohortRoleResolvers<ContextType = any, ParentType extends ResolversParentTypes['CohortRole'] = ResolversParentTypes['CohortRole']> = {
  __resolveType: TypeResolveFn<null, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
};

export type CohortRoleListResolvers<ContextType = any, ParentType extends ResolversParentTypes['CohortRoleList'] = ResolversParentTypes['CohortRoleList']> = {
  items?: Resolver<Array<ResolversTypes['CohortRole']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface EmailAddressScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['EmailAddress'], any> {
  name: 'EmailAddress';
}

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  cohortInviteMember?: Resolver<ResolversTypes['CohortMemberInviteResult'], ParentType, ContextType, RequireFields<MutationCohortInviteMemberArgs, 'input'>>;
  cohortMemberAddRole?: Resolver<ResolversTypes['CohortMemberRoleChangeResult'], ParentType, ContextType, RequireFields<MutationCohortMemberAddRoleArgs, 'memberID' | 'roleID'>>;
  cohortMemberRemoveRole?: Resolver<ResolversTypes['CohortMemberRoleChangeResult'], ParentType, ContextType, RequireFields<MutationCohortMemberRemoveRoleArgs, 'memberID' | 'roleID'>>;
  cohortRevokeMemberInvite?: Resolver<ResolversTypes['CohortRevokeMemberInviteResult'], ParentType, ContextType, RequireFields<MutationCohortRevokeMemberInviteArgs, 'inviteID'>>;
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  cohortMember?: Resolver<Maybe<ResolversTypes['CohortMember']>, ParentType, ContextType, RequireFields<QueryCohortMemberArgs, 'id'>>;
  cohortMemberInvites?: Resolver<Maybe<ResolversTypes['CohortMemberInviteList']>, ParentType, ContextType>;
  cohortMemberInvitesCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  cohortMembers?: Resolver<Maybe<ResolversTypes['CohortMemberList']>, ParentType, ContextType, Partial<QueryCohortMembersArgs>>;
  cohortRoles?: Resolver<Maybe<ResolversTypes['CohortRoleList']>, ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  CohortInviteMemberError?: CohortInviteMemberErrorResolvers<ContextType>;
  CohortMember?: CohortMemberResolvers<ContextType>;
  CohortMemberInvite?: CohortMemberInviteResolvers<ContextType>;
  CohortMemberInviteList?: CohortMemberInviteListResolvers<ContextType>;
  CohortMemberInviteResult?: CohortMemberInviteResultResolvers<ContextType>;
  CohortMemberList?: CohortMemberListResolvers<ContextType>;
  CohortMemberMetadata?: CohortMemberMetadataResolvers<ContextType>;
  CohortMemberRoleChange?: CohortMemberRoleChangeResolvers<ContextType>;
  CohortMemberRoleChangeError?: CohortMemberRoleChangeErrorResolvers<ContextType>;
  CohortMemberRoleChangeResult?: CohortMemberRoleChangeResultResolvers<ContextType>;
  CohortRevokeMemberInviteError?: CohortRevokeMemberInviteErrorResolvers<ContextType>;
  CohortRevokeMemberInviteResult?: CohortRevokeMemberInviteResultResolvers<ContextType>;
  CohortRole?: CohortRoleResolvers<ContextType>;
  CohortRoleList?: CohortRoleListResolvers<ContextType>;
  EmailAddress?: GraphQLScalarType;
  Mutation?: MutationResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
};

