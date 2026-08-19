import { act, renderHook } from '@testing-library/react';

import { MeDocument } from 'shared/api';

import { useCompleteLogin } from './useCompleteLogin';

const mockWriteQuery = jest.fn();
const mockEvict = jest.fn();
const mockGc = jest.fn();
const mockNavigate = jest.fn();
let mockLocationState: unknown;

jest.mock('@apollo/client/react', () => ({
  useApolloClient: () => ({
    writeQuery: mockWriteQuery,
    cache: { evict: mockEvict, gc: mockGc },
  }),
}));

jest.mock('react-router-dom', () => ({
  useLocation: () => ({ state: mockLocationState }),
  useNavigate: () => mockNavigate,
}));

const user = {
  id: 'user-id',
  email: 'user@example.com',
  username: 'User',
  emailVerified: true,
};

describe('useCompleteLogin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocationState = null;
    sessionStorage.clear();
  });

  it('returns to the protected internal location after login', () => {
    mockLocationState = {
      from: {
        pathname: '/convert',
        search: '?preset=web',
        hash: '#queue',
      },
    };
    sessionStorage.setItem('pendingVerificationEmail', user.email);
    const { result } = renderHook(() => useCompleteLogin());

    act(() => result.current(user));

    expect(mockWriteQuery).toHaveBeenCalledWith({
      query: MeDocument,
      data: { me: user },
    });
    expect(mockEvict).toHaveBeenCalledWith({ fieldName: 'conversionEntitlement' });
    expect(mockEvict).toHaveBeenCalledWith({ fieldName: 'myConversionBatches' });
    expect(mockGc).toHaveBeenCalled();
    expect(sessionStorage.getItem('pendingVerificationEmail')).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith('/convert?preset=web#queue', { replace: true });
  });

  it.each(['//external.example', '/\\external.example'])(
    'falls back to the app for an unsafe return location: %s',
    (pathname) => {
      mockLocationState = {
        from: { pathname, search: '?redirected=true' },
      };
      const { result } = renderHook(() => useCompleteLogin());

      act(() => result.current(user));

      expect(mockNavigate).toHaveBeenCalledWith('/app', { replace: true });
    }
  );
});
