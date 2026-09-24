import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { PublicHeader } from './PublicHeader';

let mockSession: { status: string; user?: { username: string } } = { status: 'anonymous' };

jest.mock('entities/user', () => ({
  useCurrentUser: () => mockSession,
}));

jest.mock('shared/config/theme', () => ({
  useTheme: () => ({ theme: 'light', setTheme: jest.fn() }),
}));

const renderHeader = () =>
  render(
    <MemoryRouter>
      <PublicHeader />
    </MemoryRouter>
  );

describe('PublicHeader', () => {
  beforeEach(() => {
    mockSession = { status: 'anonymous' };
  });

  it('keeps the menu closed until the burger is pressed', () => {
    renderHeader();
    const burger = screen.getByRole('button', { name: 'publicHeader.menu' });

    expect(burger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getAllByRole('link', { name: 'publicHeader.pricing' })).toHaveLength(1);

    fireEvent.click(burger);

    expect(screen.getByRole('button', { name: 'publicHeader.closeMenu' })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
    expect(screen.getAllByRole('link', { name: 'publicHeader.pricing' })).toHaveLength(2);
  });

  it('closes the menu once a link inside it navigates', () => {
    renderHeader();
    fireEvent.click(screen.getByRole('button', { name: 'publicHeader.menu' }));

    fireEvent.click(screen.getAllByRole('link', { name: 'publicHeader.pricing' })[1]);

    expect(screen.getByRole('button', { name: 'publicHeader.menu' })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
  });

  it('offers the dashboard instead of sign-in to a signed-in visitor', () => {
    mockSession = { status: 'authenticated', user: { username: 'vlad' } };
    renderHeader();

    expect(screen.getByRole('link', { name: 'publicHeader.dashboard' })).toHaveAttribute(
      'href',
      '/app'
    );
    expect(screen.queryByRole('link', { name: 'publicHeader.signIn' })).toBeNull();
  });
});
