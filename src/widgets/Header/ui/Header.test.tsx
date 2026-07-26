import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { Header } from './Header';

const mockLogout = jest.fn();
const mockNavigate = jest.fn();
const mockResetStore = jest.fn();
let mockButtonOnClick: (() => Promise<void>) | undefined;

jest.mock('@apollo/client/react', () => ({
  useApolloClient: () => ({ resetStore: mockResetStore }),
  useMutation: () => [mockLogout, { loading: false }],
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
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
    mockResetStore.mockResolvedValue([]);
  });

  it('resets active Apollo queries before navigating to the guest route', async () => {
    render(<Header />);

    fireEvent.click(screen.getByRole('button', { name: 'header.signOut' }));

    await waitFor(() => expect(mockLogout).toHaveBeenCalledTimes(1));
    expect(mockResetStore).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/sign-in', { replace: true });
    expect(mockLogout.mock.invocationCallOrder[0]).toBeLessThan(
      mockResetStore.mock.invocationCallOrder[0]
    );
    expect(mockResetStore.mock.invocationCallOrder[0]).toBeLessThan(
      mockNavigate.mock.invocationCallOrder[0]
    );
  });

  it('navigates to the guest route even when Apollo store reset rejects', async () => {
    mockResetStore.mockRejectedValueOnce(new Error('reset failed'));
    render(<Header />);

    await expect(mockButtonOnClick?.()).rejects.toThrow('reset failed');

    expect(mockNavigate).toHaveBeenCalledWith('/sign-in', { replace: true });
  });
});
