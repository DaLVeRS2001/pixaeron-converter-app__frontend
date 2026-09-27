import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { SignUpForm } from './SignUpForm';

jest.mock('../model/useSignUpModel', () => ({
  useSignUpModel: () => ({
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
    strength: 0,
    submit: jest.fn(),
    submitGoogle: jest.fn(),
  }),
}));

jest.mock('../../google/ui/GoogleButton', () => ({
  GoogleButton: ({ caption }: { caption: string }) => caption,
}));

const renderForm = () =>
  render(
    <MemoryRouter>
      <SignUpForm />
    </MemoryRouter>
  );

describe('SignUpForm', () => {
  it('states what continuing with Google and creating an account mean instead of asking for a checkbox', () => {
    renderForm();

    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    expect(screen.getByText(/legal\.continueWithGoogle/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'signUp.submit' })).toHaveAccessibleDescription(
      'legal.createAccount legal.terms legal.and legal.privacy'
    );
  });

  it('opens the legal documents in a new tab so the typed form survives', () => {
    renderForm();

    const documents = [
      ...screen.getAllByRole('link', { name: 'legal.terms' }),
      ...screen.getAllByRole('link', { name: 'legal.privacy' }),
    ];

    expect(documents).toHaveLength(4);
    for (const link of documents) expect(link).toHaveAttribute('target', '_blank');
    expect(screen.getAllByRole('link', { name: 'legal.terms' })[0]).toHaveAttribute(
      'href',
      '/terms'
    );
    expect(screen.getAllByRole('link', { name: 'legal.privacy' })[0]).toHaveAttribute(
      'href',
      '/privacy'
    );
  });
});
