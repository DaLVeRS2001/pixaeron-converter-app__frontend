import { render, screen } from '@testing-library/react';

import { VerifyEmailPanel } from './VerifyEmailPanel';
import type { useVerifyEmailModel } from '../model/useVerifyEmailModel';

type VerifyEmailModel = ReturnType<typeof useVerifyEmailModel>;

let mockModel: VerifyEmailModel;

jest.mock('../model/useVerifyEmailModel', () => ({
  useVerifyEmailModel: () => mockModel,
}));

jest.mock('react-router-dom', () => ({
  Link: ({ children }: { children: string }) => <a href="/sign-in">{children}</a>,
}));

const createModel = (overrides: Partial<VerifyEmailModel> = {}): VerifyEmailModel =>
  ({
    busy: false,
    captcha: undefined,
    cooldown: 0,
    editingEmail: false,
    email: '',
    error: undefined,
    errorMessage: '',
    maskedEmail: '',
    onCaptchaToken: jest.fn(),
    onCaptchaUnavailable: jest.fn(),
    resendEmail: jest.fn(),
    setEmail: jest.fn(),
    status: 'CHECK_EMAIL',
    verified: false,
    ...overrides,
  }) as VerifyEmailModel;

describe('VerifyEmailPanel', () => {
  it('drops the pending instructions once the address is confirmed', () => {
    mockModel = createModel({ status: 'VERIFIED', verified: true, maskedEmail: 'u****@example.com' });

    render(<VerifyEmailPanel />);

    expect(screen.getByRole('heading')).toHaveTextContent('verify.confirmedTitle');
    expect(screen.queryByText('verify.openLink')).not.toBeInTheDocument();
    expect(screen.queryByText('verify.sentTo')).not.toBeInTheDocument();
  });

  it('hides the resend controls once the address is confirmed', () => {
    mockModel = createModel({ status: 'ALREADY_VERIFIED', verified: true });

    render(<VerifyEmailPanel />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('explains what to do while the address is unconfirmed', () => {
    mockModel = createModel();

    render(<VerifyEmailPanel />);

    expect(screen.getByRole('heading')).toHaveTextContent('verify.checkTitle');
    expect(screen.getByText('verify.openLink')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
