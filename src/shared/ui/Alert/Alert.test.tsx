import { render, screen } from '@testing-library/react';

import { Alert } from './Alert';

describe('Alert', () => {
  it('marks errors with role=alert', () => {
    render(<Alert variant="error">Upload refused</Alert>);

    expect(screen.getByRole('alert')).toHaveTextContent('Upload refused');
  });

  it('keeps other variants polite with role=status', () => {
    render(<Alert variant="success">Email verified</Alert>);

    expect(screen.getByRole('status')).toHaveTextContent('Email verified');
  });
});
