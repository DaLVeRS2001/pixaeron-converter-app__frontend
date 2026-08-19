import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { AppSidebar } from './AppSidebar';

const mockLogout = jest.fn();
const mockResetCache = jest.fn();

jest.mock('@apollo/client/react', () => ({
  useApolloClient: () => ({ cache: { reset: mockResetCache } }),
  useMutation: () => [mockLogout, { loading: false }],
  useQuery: () => ({
    data: {
      conversionEntitlement: {
        storageBytes: 1073741824,
        storageBytesUsed: 268435456,
      },
    },
  }),
}));

const renderSidebar = () =>
  render(
    <MemoryRouter>
      <AppSidebar />
    </MemoryRouter>
  );

describe('AppSidebar', () => {
  beforeEach(() => {
    mockLogout.mockResolvedValue({ data: { logout: true } });
    mockResetCache.mockResolvedValue([]);
  });

  it('resets the Apollo cache after logout, in that order', async () => {
    renderSidebar();

    fireEvent.click(screen.getByRole('button', { name: /app.sidebar.signOut/ }));

    await waitFor(() => expect(mockLogout).toHaveBeenCalledTimes(1));
    expect(mockResetCache).toHaveBeenCalledWith({ discardWatches: false });
    expect(mockLogout.mock.invocationCallOrder[0]).toBeLessThan(
      mockResetCache.mock.invocationCallOrder[0]
    );
  });

  it('shows how full the storage window is', () => {
    renderSidebar();

    expect(screen.getByText('app.sidebar.storage')).toBeInTheDocument();
  });

  it('keeps conversion visible but disabled', () => {
    renderSidebar();

    const convert = screen.getByText('app.sidebar.convert');
    expect(convert.closest('[aria-disabled="true"]')).not.toBeNull();
  });
});
