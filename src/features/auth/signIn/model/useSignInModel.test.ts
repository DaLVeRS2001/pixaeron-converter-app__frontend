import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { act, renderHook, waitFor } from '@testing-library/react';

import { GoogleLoginDocument, MeDocument } from 'shared/api';

import { LEGAL_CONSENT_NOTICE } from '../../model/legalConsent';
import { useSignInModel } from './useSignInModel';

const mockGoogleLogin = jest.fn();
const mockLogin = jest.fn();
const mockNavigate = jest.fn();
const mockUseMutation = jest.fn();
const mockWriteQuery = jest.fn();
let mockLocationState: unknown = null;

const setTurnstileSiteKey = (value: string) =>
  Object.assign(globalThis, { __TURNSTILE_SITE_KEY__: value });

jest.mock('@apollo/client/react', () => ({
  useApolloClient: () => ({
    writeQuery: mockWriteQuery,
    cache: { evict: jest.fn(), gc: jest.fn() },
  }),
  useMutation: (...args: unknown[]) => mockUseMutation(...args),
}));

jest.mock('react-router-dom', () => ({
  useLocation: () => ({ state: mockLocationState }),
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

const emailNotVerifiedError = () =>
  new CombinedGraphQLErrors({
    data: null,
    errors: [
      {
        message: 'Email is not verified',
        extensions: { code: 'EMAIL_NOT_VERIFIED' },
      },
    ],
  });

const captchaRequiredError = (action: string) =>
  new CombinedGraphQLErrors({
    data: null,
    errors: [
      {
        message: 'Captcha verification is required',
        extensions: { action, code: 'CAPTCHA_REQUIRED' },
      },
    ],
  });

const renderModel = () => {
  mockUseMutation.mockImplementation((document) =>
    document === GoogleLoginDocument ? [mockGoogleLogin] : [mockLogin]
  );
  return renderHook(() => useSignInModel());
};

describe('useSignInModel CAPTCHA timing', () => {
  beforeEach(() => setTurnstileSiteKey(''));

  it('runs Google CAPTCHA after selection and before the mutation', async () => {
    setTurnstileSiteKey('turnstile-site-key');
    mockGoogleLogin.mockResolvedValue({ data: undefined });
    const { result } = renderModel();

    expect(result.current.captcha).toBeUndefined();
    act(() => result.current.submitGoogle('google-id-token'));

    expect(mockGoogleLogin).not.toHaveBeenCalled();
    expect(result.current.captcha).toEqual({ action: 'google_login', version: 1 });

    act(() => result.current.onCaptchaToken('google-captcha-token'));

    await waitFor(() =>
      expect(mockGoogleLogin).toHaveBeenCalledWith({
        variables: {
          input: {
            idToken: 'google-id-token',
            captchaToken: 'google-captcha-token',
          },
        },
      })
    );
  });

  it('keeps password login adaptive and retries it after a requested CAPTCHA', async () => {
    mockLogin
      .mockRejectedValueOnce(captchaRequiredError('login'))
      .mockResolvedValueOnce({ data: undefined });
    const { result } = renderModel();

    act(() => {
      result.current.form.setValue('email', 'user@example.com');
      result.current.form.setValue('password', 'password');
    });
    await act(async () => {
      await result.current.submit();
    });

    expect(mockLogin).toHaveBeenNthCalledWith(1, {
      variables: {
        input: {
          email: 'user@example.com',
          password: 'password',
          rememberMe: false,
          captchaToken: undefined,
        },
      },
    });
    expect(result.current.captcha).toEqual({ action: 'login', version: 1 });

    act(() => result.current.submitGoogle('ignored-google-token'));
    expect(mockGoogleLogin).not.toHaveBeenCalled();
    expect(result.current.captcha).toEqual({ action: 'login', version: 1 });

    act(() => result.current.onCaptchaToken('login-captcha-token'));

    await waitFor(() =>
      expect(mockLogin).toHaveBeenNthCalledWith(2, {
        variables: {
          input: {
            email: 'user@example.com',
            password: 'password',
            rememberMe: false,
            captchaToken: 'login-captcha-token',
          },
        },
      })
    );
  });
  it('ignores Google credentials while password login is in flight', async () => {
    let finishLogin!: (value: { data: undefined }) => void;
    mockLogin.mockImplementationOnce(
      () => new Promise<{ data: undefined }>((resolve) => (finishLogin = resolve))
    );
    const { result } = renderModel();

    act(() => {
      result.current.form.setValue('email', 'user@example.com');
      result.current.form.setValue('password', 'password');
      void result.current.submit();
    });
    await waitFor(() => expect(result.current.busy).toBe(true));

    act(() => result.current.submitGoogle('ignored-google-token'));

    expect(mockGoogleLogin).not.toHaveBeenCalled();
    expect(result.current.captcha).toBeUndefined();

    await act(async () => finishLogin({ data: undefined }));
  });
});

describe('useSignInModel routing', () => {
  beforeEach(() => {
    setTurnstileSiteKey('');
    mockLocationState = null;
    sessionStorage.clear();
  });

  it('writes the authenticated user to Apollo cache before entering the app', async () => {
    const user = {
      id: 'user-id',
      email: 'user@example.com',
      username: 'User',
      emailVerified: true,
    };
    mockLogin.mockResolvedValue({ data: { login: user } });
    const { result } = renderModel();

    act(() => {
      result.current.form.setValue('email', 'user@example.com');
      result.current.form.setValue('password', 'password');
    });
    await act(async () => {
      await result.current.submit();
    });

    expect(mockWriteQuery).toHaveBeenCalledWith({
      query: MeDocument,
      data: { me: user },
    });
    expect(mockNavigate).toHaveBeenCalledWith('/app', { replace: true });
  });

  it('routes an unverified password login using the normalized email', async () => {
    mockLogin.mockRejectedValue(emailNotVerifiedError());
    const { result } = renderModel();

    act(() => {
      result.current.form.setValue('email', 'USER@EXAMPLE.COM');
      result.current.form.setValue('password', 'password');
    });
    await act(async () => {
      await result.current.submit();
    });

    expect(sessionStorage.getItem('pendingVerificationEmail')).toBe('user@example.com');
    expect(mockNavigate).toHaveBeenCalledWith('/verify-email', {
      state: { email: 'user@example.com' },
    });
  });

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

  it('preserves a safe return location when routing an unknown Google identity to signup', async () => {
    mockLocationState = {
      from: { pathname: '/app', search: '?view=queue', hash: '#latest' },
    };
    mockGoogleLogin.mockRejectedValue(legalConsentError());
    const { result } = renderModel();

    await act(async () => {
      await result.current.submitGoogle('new-google-token');
    });

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith('/sign-up', {
        replace: true,
        state: {
          notice: LEGAL_CONSENT_NOTICE,
          from: { pathname: '/app', search: '?view=queue', hash: '#latest' },
        },
      })
    );
    expect(JSON.stringify(mockNavigate.mock.calls)).not.toContain('new-google-token');
    expect(localStorage.getItem('google-id-token')).toBeNull();
    expect(sessionStorage.getItem('google-id-token')).toBeNull();
  });
});
