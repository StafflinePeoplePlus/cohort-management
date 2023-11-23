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

export type CohortMemberInvite = {
  __typename?: 'CohortMemberInvite';
  /** ID associated with the created invite */
  inviteID: Scalars['ID']['output'];
};

export type CohortMemberInviteInput = {
  /** Email address of the member to send the invitation to */
  email: Scalars['EmailAddress']['input'];
  /** Metadata to be associated with the invited member once accepted */
  metadata: CohortMemberMetadataInput;
};

export type CohortMemberInviteResult = CohortInviteMemberError | CohortMemberInvite;

export type CohortMemberMetadataInput = CohortManagement.CohortMemberMetadataInput;

export type Mutation = {
  __typename?: 'Mutation';
  /** Invite a new member by email address */
  cohortInviteMember: CohortMemberInviteResult;
};


export type MutationCohortInviteMemberArgs = {
  input: CohortMemberInviteInput;
};

export type Query = {
  __typename?: 'Query';
  cohortMemberInvitesCount?: Maybe<Scalars['Int']['output']>;
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
};


/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  CohortInviteMemberError: ResolverTypeWrapper<CohortInviteMemberError>;
  CohortInviteMemberErrorReason: CohortInviteMemberErrorReason;
  CohortMemberInvite: ResolverTypeWrapper<CohortMemberInvite>;
  CohortMemberInviteInput: CohortMemberInviteInput;
  CohortMemberInviteResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['CohortMemberInviteResult']>;
  CohortMemberMetadataInput: ResolverTypeWrapper<CohortMemberMetadataInput>;
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
  CohortMemberInvite: CohortMemberInvite;
  CohortMemberInviteInput: CohortMemberInviteInput;
  CohortMemberInviteResult: ResolversUnionTypes<ResolversParentTypes>['CohortMemberInviteResult'];
  CohortMemberMetadataInput: CohortMemberMetadataInput;
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

export type CohortMemberInviteResolvers<ContextType = any, ParentType extends ResolversParentTypes['CohortMemberInvite'] = ResolversParentTypes['CohortMemberInvite']> = {
  inviteID?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CohortMemberInviteResultResolvers<ContextType = any, ParentType extends ResolversParentTypes['CohortMemberInviteResult'] = ResolversParentTypes['CohortMemberInviteResult']> = {
  __resolveType: TypeResolveFn<'CohortInviteMemberError' | 'CohortMemberInvite', ParentType, ContextType>;
};

export type CohortMemberMetadataInputResolvers<ContextType = any, ParentType extends ResolversParentTypes['CohortMemberMetadataInput'] = ResolversParentTypes['CohortMemberMetadataInput']> = {
  _empty?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface EmailAddressScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['EmailAddress'], any> {
  name: 'EmailAddress';
}

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  cohortInviteMember?: Resolver<ResolversTypes['CohortMemberInviteResult'], ParentType, ContextType, RequireFields<MutationCohortInviteMemberArgs, 'input'>>;
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  cohortMemberInvitesCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  CohortInviteMemberError?: CohortInviteMemberErrorResolvers<ContextType>;
  CohortMemberInvite?: CohortMemberInviteResolvers<ContextType>;
  CohortMemberInviteResult?: CohortMemberInviteResultResolvers<ContextType>;
  CohortMemberMetadataInput?: CohortMemberMetadataInputResolvers<ContextType>;
  EmailAddress?: GraphQLScalarType;
  Mutation?: MutationResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
};

