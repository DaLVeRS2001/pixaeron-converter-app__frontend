/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

import * as types from './graphql';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
  'query Me {\n  me {\n    id\n    email\n    username\n    emailVerified\n  }\n}\n\nmutation Logout {\n  logout\n}': typeof types.MeDocument;
  'mutation Login($input: LoginInput!) {\n  login(loginInput: $input) {\n    id\n    email\n    username\n    emailVerified\n  }\n}\n\nmutation Register($input: RegisterInput!) {\n  register(registerInput: $input) {\n    accepted\n    email\n  }\n}\n\nmutation GoogleLogin($input: GoogleLoginInput!) {\n  googleLogin(googleLoginInput: $input) {\n    id\n    email\n    username\n    emailVerified\n  }\n}\n\nmutation ResendEmailVerification($input: EmailActionInput!) {\n  resendEmailVerification(input: $input) {\n    accepted\n  }\n}\n\nmutation VerifyEmail($input: AuthTokenInput!) {\n  verifyEmail(input: $input) {\n    status\n  }\n}\n\nmutation RequestPasswordReset($input: EmailActionInput!) {\n  requestPasswordReset(input: $input) {\n    accepted\n  }\n}\n\nmutation ResetPassword($input: ResetPasswordInput!) {\n  resetPassword(input: $input) {\n    status\n  }\n}': typeof types.LoginDocument;
};
const documents: Documents = {
  'query Me {\n  me {\n    id\n    email\n    username\n    emailVerified\n  }\n}\n\nmutation Logout {\n  logout\n}':
    types.MeDocument,
  'mutation Login($input: LoginInput!) {\n  login(loginInput: $input) {\n    id\n    email\n    username\n    emailVerified\n  }\n}\n\nmutation Register($input: RegisterInput!) {\n  register(registerInput: $input) {\n    accepted\n    email\n  }\n}\n\nmutation GoogleLogin($input: GoogleLoginInput!) {\n  googleLogin(googleLoginInput: $input) {\n    id\n    email\n    username\n    emailVerified\n  }\n}\n\nmutation ResendEmailVerification($input: EmailActionInput!) {\n  resendEmailVerification(input: $input) {\n    accepted\n  }\n}\n\nmutation VerifyEmail($input: AuthTokenInput!) {\n  verifyEmail(input: $input) {\n    status\n  }\n}\n\nmutation RequestPasswordReset($input: EmailActionInput!) {\n  requestPasswordReset(input: $input) {\n    accepted\n  }\n}\n\nmutation ResetPassword($input: ResetPasswordInput!) {\n  resetPassword(input: $input) {\n    status\n  }\n}':
    types.LoginDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: 'query Me {\n  me {\n    id\n    email\n    username\n    emailVerified\n  }\n}\n\nmutation Logout {\n  logout\n}'
): (typeof documents)['query Me {\n  me {\n    id\n    email\n    username\n    emailVerified\n  }\n}\n\nmutation Logout {\n  logout\n}'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: 'mutation Login($input: LoginInput!) {\n  login(loginInput: $input) {\n    id\n    email\n    username\n    emailVerified\n  }\n}\n\nmutation Register($input: RegisterInput!) {\n  register(registerInput: $input) {\n    accepted\n    email\n  }\n}\n\nmutation GoogleLogin($input: GoogleLoginInput!) {\n  googleLogin(googleLoginInput: $input) {\n    id\n    email\n    username\n    emailVerified\n  }\n}\n\nmutation ResendEmailVerification($input: EmailActionInput!) {\n  resendEmailVerification(input: $input) {\n    accepted\n  }\n}\n\nmutation VerifyEmail($input: AuthTokenInput!) {\n  verifyEmail(input: $input) {\n    status\n  }\n}\n\nmutation RequestPasswordReset($input: EmailActionInput!) {\n  requestPasswordReset(input: $input) {\n    accepted\n  }\n}\n\nmutation ResetPassword($input: ResetPasswordInput!) {\n  resetPassword(input: $input) {\n    status\n  }\n}'
): (typeof documents)['mutation Login($input: LoginInput!) {\n  login(loginInput: $input) {\n    id\n    email\n    username\n    emailVerified\n  }\n}\n\nmutation Register($input: RegisterInput!) {\n  register(registerInput: $input) {\n    accepted\n    email\n  }\n}\n\nmutation GoogleLogin($input: GoogleLoginInput!) {\n  googleLogin(googleLoginInput: $input) {\n    id\n    email\n    username\n    emailVerified\n  }\n}\n\nmutation ResendEmailVerification($input: EmailActionInput!) {\n  resendEmailVerification(input: $input) {\n    accepted\n  }\n}\n\nmutation VerifyEmail($input: AuthTokenInput!) {\n  verifyEmail(input: $input) {\n    status\n  }\n}\n\nmutation RequestPasswordReset($input: EmailActionInput!) {\n  requestPasswordReset(input: $input) {\n    accepted\n  }\n}\n\nmutation ResetPassword($input: ResetPasswordInput!) {\n  resetPassword(input: $input) {\n    status\n  }\n}'];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> =
  TDocumentNode extends DocumentNode<infer TType, any> ? TType : never;
