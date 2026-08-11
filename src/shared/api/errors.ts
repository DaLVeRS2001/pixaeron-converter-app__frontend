import { CombinedGraphQLErrors, ServerError } from '@apollo/client/errors';

type GraphQLErrorDetails = {
  code?: string;
  action?: string;
  retryAfter?: number;
};

const parseRetryAfter = (value: string | null) => {
  if (!value || !/^\d+$/.test(value)) return undefined;

  const seconds = Number(value);
  return Number.isSafeInteger(seconds) ? seconds : undefined;
};

const getServerErrorDetails = (error: ServerError): GraphQLErrorDetails => {
  if (error.statusCode === 429) {
    const retryAfter = parseRetryAfter(error.response.headers.get('retry-after'));

    return {
      code: 'TOO_MANY_REQUESTS',
      ...(retryAfter !== undefined ? { retryAfter } : {}),
    };
  }

  if (error.statusCode === 503) {
    return { code: 'SERVICE_UNAVAILABLE' };
  }

  return { code: 'NETWORK_ERROR' };
};

const getGraphQLErrorDetails = (error: unknown): GraphQLErrorDetails => {
  if (ServerError.is(error)) {
    return getServerErrorDetails(error);
  }

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
