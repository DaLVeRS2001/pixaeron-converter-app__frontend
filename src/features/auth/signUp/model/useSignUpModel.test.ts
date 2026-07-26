import { act, renderHook, waitFor } from '@testing-library/react';

import { RegisterDocument } from 'shared/api';

import { CURRENT_LEGAL_CONSENT } from '../../model/legalConsent';
import { useSignUpModel } from './useSignUpModel';

const mockGoogleLogin = jest.fn();
const mockNavigate = jest.fn();
const mockRegister = jest.fn();
const mockUseMutation = jest.fn();
const mockWriteQuery = jest.fn();

jest.mock('@apollo/client/react', () => ({
  useApolloClient: () => ({ writeQuery: mockWriteQuery }),
  useMutation: (...args: unknown[]) => mockUseMutation(...args),
}));

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

const renderModel = () => {
  mockUseMutation.mockImplementation((document) =>
    document === RegisterDocument ? [mockRegister] : [mockGoogleLogin]
  );
  return renderHook(() => useSignUpModel());
};

describe('useSignUpModel legal consent', () => {
  beforeEach(() => {
    mockRegister.mockResolvedValue({
      data: { register: { accepted: false, email: 'user@example.com' } },
    });
    mockGoogleLogin.mockResolvedValue({ data: undefined });
  });

  it('sends current consent when creating an account with email', async () => {
    const { result } = renderModel();

    act(() => {
      result.current.form.setValue('username', 'User Name');
      result.current.form.setValue('email', 'user@example.com');
      result.current.form.setValue('password', 'Strong1!');
      result.current.form.setValue('confirmPassword', 'Strong1!');
      result.current.form.setValue('termsAccepted', true);
    });
    await act(async () => {
      await result.current.submit();
    });

    expect(mockRegister).toHaveBeenCalledWith({
      variables: {
        input: {
          username: 'User Name',
          email: 'user@example.com',
          password: 'Strong1!',
          captchaToken: undefined,
          ...CURRENT_LEGAL_CONSENT,
        },
      },
    });
  });

  it('sends current consent when explicitly creating an account with Google', async () => {
    const { result } = renderModel();
    act(() => result.current.form.setValue('termsAccepted', true));
    act(() => result.current.submitGoogle('google-id-token'));

    await waitFor(() =>
      expect(mockGoogleLogin).toHaveBeenCalledWith({
        variables: {
          input: {
            idToken: 'google-id-token',
            captchaToken: undefined,
            ...CURRENT_LEGAL_CONSENT,
          },
        },
      })
    );
  });
});
