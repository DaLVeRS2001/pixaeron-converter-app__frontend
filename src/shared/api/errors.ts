import { CombinedGraphQLErrors } from '@apollo/client/errors';

type GraphQLErrorDetails = {
  code?: string;
  action?: string;
  retryAfter?: number;
};

const getGraphQLErrorDetails = (error: unknown): GraphQLErrorDetails => {
  if (!CombinedGraphQLErrors.is(error)) {
    return { code: 'NETWORK_ERROR' };
  }

  const graphQLError = error.errors[0];
  const extensions = graphQLError?.extensions as
    | {
        code?: unknown;
        action?: unknown;
        retryAfter?: unknown;
        originalError?: {
          code?: unknown;
          action?: unknown;
          retryAfter?: unknown;
        };
      }
    | undefined;
  const legacy = extensions?.originalError;
  const code = legacy?.code ?? extensions?.code;
  const action = legacy?.action ?? extensions?.action;
  const retryAfter = legacy?.retryAfter ?? extensions?.retryAfter;

  return {
    ...(typeof code === 'string' ? { code } : {}),
    ...(typeof action === 'string' ? { action } : {}),
    ...(typeof retryAfter === 'number' && Number.isFinite(retryAfter) && retryAfter >= 0
      ? { retryAfter }
      : {}),
  };
};

export { getGraphQLErrorDetails };
export type { GraphQLErrorDetails };
