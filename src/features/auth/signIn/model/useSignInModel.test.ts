import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { act, renderHook, waitFor } from '@testing-library/react';

import { GoogleLoginDocument } from 'shared/api';

import { LEGAL_CONSENT_NOTICE } from '../../model/legalConsent';
import { useSignInModel } from './useSignInModel';

const mockGoogleLogin = jest.fn();
const mockLogin = jest.fn();
const mockNavigate = jest.fn();
const mockUseMutation = jest.fn();
const mockWriteQuery = jest.fn();

jest.mock('@apollo/client/react', () => ({
  useApolloClient: () => ({ writeQuery: mockWriteQuery }),
  useMutation: (...args: unknown[]) => mockUseMutation(...args),
}));

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

const legalConsentError = () =>
  new CombinedGraphQLErrors({
    data: null,
    errors: [
      {
        message: 'private backend message',
        extensions: {
          action: 'accept_legal_terms',
          code: 'LEGAL_CONSENT_REQUIRED',
        },
      },
    ],
  });

const renderModel = () => {
  mockUseMutation.mockImplementation((document) =>
    document === GoogleLoginDocument ? [mockGoogleLogin] : [mockLogin]
  );
  return renderHook(() => useSignInModel());
};

describe('useSignInModel Google consent routing', () => {
  it('does not send account-creation consent during an existing Google sign-in', async () => {
    mockGoogleLogin.mockResolvedValue({ data: undefined });
    const { result } = renderModel();

    await act(async () => {
      await result.current.submitGoogle('existing-google-token');
    });

    expect(mockGoogleLogin).toHaveBeenCalledWith({
      variables: {
        input: {
          idToken: 'existing-google-token',
          captchaToken: undefined,
        },
      },
    });
  });

  it('routes unknown Google identity to explicit signup without persisting its token', async () => {
    mockGoogleLogin.mockRejectedValue(legalConsentError());
    const { result } = renderModel();

    await act(async () => {
      await result.current.submitGoogle('new-google-token');
    });

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith('/sign-up', {
        replace: true,
        state: { notice: LEGAL_CONSENT_NOTICE },
      })
    );
    expect(JSON.stringify(mockNavigate.mock.calls)).not.toContain('new-google-token');
    expect(localStorage.getItem('google-id-token')).toBeNull();
    expect(sessionStorage.getItem('google-id-token')).toBeNull();
  });
});
