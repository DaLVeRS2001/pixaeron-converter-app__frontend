import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { Header } from './Header';

const mockLogout = jest.fn();
const mockResetCache = jest.fn();
let mockButtonOnClick: (() => Promise<void>) | undefined;

jest.mock('@apollo/client/react', () => ({
  useApolloClient: () => ({ cache: { reset: mockResetCache } }),
  useMutation: () => [mockLogout, { loading: false }],
}));

jest.mock('features/changeLanguage', () => ({
  LanguageSwitcher: () => <div data-testid="language-switcher" />,
}));

jest.mock('shared/ui/Button', () => ({
  Button: ({
    children,
    disabled,
    onClick,
  }: {
    children: string;
    disabled?: boolean;
    onClick: () => Promise<void>;
  }) => {
    mockButtonOnClick = onClick;
    return (
      <button type="button" disabled={disabled} onClick={onClick}>
        {children}
      </button>
    );
  },
}));

describe('Header', () => {
  beforeEach(() => {
    mockButtonOnClick = undefined;
    mockLogout.mockResolvedValue({ data: { logout: true } });
    mockResetCache.mockResolvedValue([]);
  });

  it('resets the Apollo cache after logout', async () => {
    render(<Header />);

    fireEvent.click(screen.getByRole('button', { name: 'header.signOut' }));

    await waitFor(() => expect(mockLogout).toHaveBeenCalledTimes(1));
    expect(mockResetCache).toHaveBeenCalledWith({ discardWatches: false });
    expect(mockLogout.mock.invocationCallOrder[0]).toBeLessThan(
      mockResetCache.mock.invocationCallOrder[0]
    );
  });

  it('propagates a cache cleanup failure after logout', async () => {
    mockResetCache.mockRejectedValueOnce(new Error('cleanup failed'));
    render(<Header />);

    await expect(mockButtonOnClick?.()).rejects.toThrow('cleanup failed');
  });
});
