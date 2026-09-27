import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { SignInForm } from './SignInForm';

jest.mock('../model/useSignInModel', () => ({
  useSignInModel: () => ({
    busy: false,
    captcha: undefined,
    errorMessage: '',
    form: {
      formState: { errors: {} },
      register: (name: string) => ({
        name,
        onBlur: jest.fn(),
        onChange: jest.fn(),
        ref: jest.fn(),
      }),
    },
    onCaptchaToken: jest.fn(),
    onCaptchaUnavailable: jest.fn(),
    onGoogleUnavailable: jest.fn(),
    submit: jest.fn(),
    submitGoogle: jest.fn(),
  }),
}));

jest.mock('../../google/ui/GoogleButton', () => ({
  GoogleButton: ({ caption }: { caption: string }) => caption,
}));

describe('SignInForm', () => {
  it('shows the Google consent line and only the Remember me checkbox', () => {
    render(
      <MemoryRouter>
        <SignInForm />
      </MemoryRouter>
    );

    expect(screen.getByText(/legal\.continueWithGoogle/)).toBeInTheDocument();
    expect(screen.getAllByRole('checkbox')).toEqual([
      screen.getByRole('checkbox', { name: 'signIn.rememberMe' }),
    ]);
    expect(screen.getByRole('link', { name: 'legal.terms' })).toHaveAttribute(
      'href',
      '/terms'
    );
    expect(screen.getByRole('link', { name: 'legal.privacy' })).toHaveAttribute(
      'target',
      '_blank'
    );
  });
});
