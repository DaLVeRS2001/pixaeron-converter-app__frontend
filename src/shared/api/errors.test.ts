import { CombinedGraphQLErrors } from '@apollo/client/errors';

import { getGraphQLErrorDetails } from './errors';

const graphQLError = (
  extensions: Record<string, unknown>,
  message = 'private backend message'
) =>
  new CombinedGraphQLErrors({
    data: null,
    errors: [{ message, extensions }],
  });

describe('getGraphQLErrorDetails', () => {
  it('returns only the structured public contract and ignores the backend message', () => {
    expect(
      getGraphQLErrorDetails(
        graphQLError({
          code: 'CAPTCHA_REQUIRED',
          action: 'login',
          retryAfter: 30,
          privateDetails: 'must not escape',
        })
      )
    ).toEqual({ code: 'CAPTCHA_REQUIRED', action: 'login', retryAfter: 30 });
  });

  it('supports the temporary legacy extension shape without exposing its message', () => {
    expect(
      getGraphQLErrorDetails(
        graphQLError({
          originalError: {
            code: 'AUTH_ACTION_COOLDOWN',
            action: 'resend_confirmation',
            retryAfter: 12,
            message: 'private legacy message',
          },
        })
      )
    ).toEqual({
      code: 'AUTH_ACTION_COOLDOWN',
      action: 'resend_confirmation',
      retryAfter: 12,
    });
  });

  it('rejects invalid retry metadata', () => {
    expect(
      getGraphQLErrorDetails(graphQLError({ code: 'BAD_REQUEST', retryAfter: -1 }))
    ).toEqual({ code: 'BAD_REQUEST' });
  });

  it('classifies non-GraphQL failures as network errors', () => {
    expect(getGraphQLErrorDetails(new Error('network details'))).toEqual({
      code: 'NETWORK_ERROR',
    });
  });
});
