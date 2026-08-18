/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

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
    "query ConversionEntitlement {\n  conversionEntitlement {\n    planCode\n    maxBatchFiles\n    maxFileBytes\n    dailyFiles\n    remainingToday\n    maxConcurrentFiles\n  }\n}\n\nquery ConversionBatch($id: ID!, $batchToken: String) {\n  conversionBatch(id: $id, batchToken: $batchToken) {\n    id\n    status\n    fileCount\n    expiresAt\n    files {\n      id\n      status\n      inputBytes\n      outputBytes\n      outputFormat\n      resultKind\n      width\n      height\n      failureCode\n      downloadUrl\n    }\n  }\n}\n\nmutation CreateConversionBatch($input: CreateConversionBatchInput!) {\n  createConversionBatch(input: $input) {\n    id\n    status\n    fileCount\n    expiresAt\n    batchToken\n    files {\n      id\n      status\n      upload {\n        url\n        fields {\n          name\n          value\n        }\n      }\n    }\n  }\n}\n\nmutation CompleteConversionUploads($input: CompleteConversionUploadsInput!) {\n  completeConversionUploads(input: $input) {\n    admittedFiles\n    verifiedFiles\n    missingFiles\n    batch {\n      id\n      status\n    }\n  }\n}": typeof types.ConversionEntitlementDocument,
    "query Me {\n  me {\n    id\n    email\n    username\n    emailVerified\n  }\n}\n\nmutation RefreshSession {\n  refreshSession\n}\n\nmutation Logout {\n  logout\n}": typeof types.MeDocument,
    "mutation Login($input: LoginInput!) {\n  login(loginInput: $input) {\n    id\n    email\n    username\n    emailVerified\n  }\n}\n\nmutation Register($input: RegisterInput!) {\n  register(registerInput: $input) {\n    accepted\n    email\n  }\n}\n\nmutation GoogleLogin($input: GoogleLoginInput!) {\n  googleLogin(googleLoginInput: $input) {\n    id\n    email\n    username\n    emailVerified\n  }\n}\n\nmutation ResendEmailVerification($input: EmailActionInput!) {\n  resendEmailVerification(input: $input) {\n    accepted\n  }\n}\n\nmutation VerifyEmail($input: AuthTokenInput!) {\n  verifyEmail(input: $input) {\n    status\n  }\n}\n\nmutation RequestPasswordReset($input: EmailActionInput!) {\n  requestPasswordReset(input: $input) {\n    accepted\n  }\n}\n\nmutation ResetPassword($input: ResetPasswordInput!) {\n  resetPassword(input: $input) {\n    status\n  }\n}": typeof types.LoginDocument,
};
const documents: Documents = {
    "query ConversionEntitlement {\n  conversionEntitlement {\n    planCode\n    maxBatchFiles\n    maxFileBytes\n    dailyFiles\n    remainingToday\n    maxConcurrentFiles\n  }\n}\n\nquery ConversionBatch($id: ID!, $batchToken: String) {\n  conversionBatch(id: $id, batchToken: $batchToken) {\n    id\n    status\n    fileCount\n    expiresAt\n    files {\n      id\n      status\n      inputBytes\n      outputBytes\n      outputFormat\n      resultKind\n      width\n      height\n      failureCode\n      downloadUrl\n    }\n  }\n}\n\nmutation CreateConversionBatch($input: CreateConversionBatchInput!) {\n  createConversionBatch(input: $input) {\n    id\n    status\n    fileCount\n    expiresAt\n    batchToken\n    files {\n      id\n      status\n      upload {\n        url\n        fields {\n          name\n          value\n        }\n      }\n    }\n  }\n}\n\nmutation CompleteConversionUploads($input: CompleteConversionUploadsInput!) {\n  completeConversionUploads(input: $input) {\n    admittedFiles\n    verifiedFiles\n    missingFiles\n    batch {\n      id\n      status\n    }\n  }\n}": types.ConversionEntitlementDocument,
    "query Me {\n  me {\n    id\n    email\n    username\n    emailVerified\n  }\n}\n\nmutation RefreshSession {\n  refreshSession\n}\n\nmutation Logout {\n  logout\n}": types.MeDocument,
    "mutation Login($input: LoginInput!) {\n  login(loginInput: $input) {\n    id\n    email\n    username\n    emailVerified\n  }\n}\n\nmutation Register($input: RegisterInput!) {\n  register(registerInput: $input) {\n    accepted\n    email\n  }\n}\n\nmutation GoogleLogin($input: GoogleLoginInput!) {\n  googleLogin(googleLoginInput: $input) {\n    id\n    email\n    username\n    emailVerified\n  }\n}\n\nmutation ResendEmailVerification($input: EmailActionInput!) {\n  resendEmailVerification(input: $input) {\n    accepted\n  }\n}\n\nmutation VerifyEmail($input: AuthTokenInput!) {\n  verifyEmail(input: $input) {\n    status\n  }\n}\n\nmutation RequestPasswordReset($input: EmailActionInput!) {\n  requestPasswordReset(input: $input) {\n    accepted\n  }\n}\n\nmutation ResetPassword($input: ResetPasswordInput!) {\n  resetPassword(input: $input) {\n    status\n  }\n}": types.LoginDocument,
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
export function graphql(source: "query ConversionEntitlement {\n  conversionEntitlement {\n    planCode\n    maxBatchFiles\n    maxFileBytes\n    dailyFiles\n    remainingToday\n    maxConcurrentFiles\n  }\n}\n\nquery ConversionBatch($id: ID!, $batchToken: String) {\n  conversionBatch(id: $id, batchToken: $batchToken) {\n    id\n    status\n    fileCount\n    expiresAt\n    files {\n      id\n      status\n      inputBytes\n      outputBytes\n      outputFormat\n      resultKind\n      width\n      height\n      failureCode\n      downloadUrl\n    }\n  }\n}\n\nmutation CreateConversionBatch($input: CreateConversionBatchInput!) {\n  createConversionBatch(input: $input) {\n    id\n    status\n    fileCount\n    expiresAt\n    batchToken\n    files {\n      id\n      status\n      upload {\n        url\n        fields {\n          name\n          value\n        }\n      }\n    }\n  }\n}\n\nmutation CompleteConversionUploads($input: CompleteConversionUploadsInput!) {\n  completeConversionUploads(input: $input) {\n    admittedFiles\n    verifiedFiles\n    missingFiles\n    batch {\n      id\n      status\n    }\n  }\n}"): (typeof documents)["query ConversionEntitlement {\n  conversionEntitlement {\n    planCode\n    maxBatchFiles\n    maxFileBytes\n    dailyFiles\n    remainingToday\n    maxConcurrentFiles\n  }\n}\n\nquery ConversionBatch($id: ID!, $batchToken: String) {\n  conversionBatch(id: $id, batchToken: $batchToken) {\n    id\n    status\n    fileCount\n    expiresAt\n    files {\n      id\n      status\n      inputBytes\n      outputBytes\n      outputFormat\n      resultKind\n      width\n      height\n      failureCode\n      downloadUrl\n    }\n  }\n}\n\nmutation CreateConversionBatch($input: CreateConversionBatchInput!) {\n  createConversionBatch(input: $input) {\n    id\n    status\n    fileCount\n    expiresAt\n    batchToken\n    files {\n      id\n      status\n      upload {\n        url\n        fields {\n          name\n          value\n        }\n      }\n    }\n  }\n}\n\nmutation CompleteConversionUploads($input: CompleteConversionUploadsInput!) {\n  completeConversionUploads(input: $input) {\n    admittedFiles\n    verifiedFiles\n    missingFiles\n    batch {\n      id\n      status\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query Me {\n  me {\n    id\n    email\n    username\n    emailVerified\n  }\n}\n\nmutation RefreshSession {\n  refreshSession\n}\n\nmutation Logout {\n  logout\n}"): (typeof documents)["query Me {\n  me {\n    id\n    email\n    username\n    emailVerified\n  }\n}\n\nmutation RefreshSession {\n  refreshSession\n}\n\nmutation Logout {\n  logout\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation Login($input: LoginInput!) {\n  login(loginInput: $input) {\n    id\n    email\n    username\n    emailVerified\n  }\n}\n\nmutation Register($input: RegisterInput!) {\n  register(registerInput: $input) {\n    accepted\n    email\n  }\n}\n\nmutation GoogleLogin($input: GoogleLoginInput!) {\n  googleLogin(googleLoginInput: $input) {\n    id\n    email\n    username\n    emailVerified\n  }\n}\n\nmutation ResendEmailVerification($input: EmailActionInput!) {\n  resendEmailVerification(input: $input) {\n    accepted\n  }\n}\n\nmutation VerifyEmail($input: AuthTokenInput!) {\n  verifyEmail(input: $input) {\n    status\n  }\n}\n\nmutation RequestPasswordReset($input: EmailActionInput!) {\n  requestPasswordReset(input: $input) {\n    accepted\n  }\n}\n\nmutation ResetPassword($input: ResetPasswordInput!) {\n  resetPassword(input: $input) {\n    status\n  }\n}"): (typeof documents)["mutation Login($input: LoginInput!) {\n  login(loginInput: $input) {\n    id\n    email\n    username\n    emailVerified\n  }\n}\n\nmutation Register($input: RegisterInput!) {\n  register(registerInput: $input) {\n    accepted\n    email\n  }\n}\n\nmutation GoogleLogin($input: GoogleLoginInput!) {\n  googleLogin(googleLoginInput: $input) {\n    id\n    email\n    username\n    emailVerified\n  }\n}\n\nmutation ResendEmailVerification($input: EmailActionInput!) {\n  resendEmailVerification(input: $input) {\n    accepted\n  }\n}\n\nmutation VerifyEmail($input: AuthTokenInput!) {\n  verifyEmail(input: $input) {\n    status\n  }\n}\n\nmutation RequestPasswordReset($input: EmailActionInput!) {\n  requestPasswordReset(input: $input) {\n    accepted\n  }\n}\n\nmutation ResetPassword($input: ResetPasswordInput!) {\n  resetPassword(input: $input) {\n    status\n  }\n}"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;