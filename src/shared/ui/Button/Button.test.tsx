import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { Button } from './Button';

describe('Button', () => {
  it('forwards link props when rendered as a link', () => {
    const handleClick = jest.fn();

    render(
      <MemoryRouter>
        <Button
          to="/target"
          aria-label="Open target"
          data-testid="target-link"
          onClick={handleClick}
        >
          Continue
        </Button>
      </MemoryRouter>
    );

    const link = screen.getByTestId('target-link');
    expect(link).toHaveAttribute('href', '/target');
    expect(link).toHaveAttribute('aria-label', 'Open target');

    fireEvent.click(link);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('keeps native button props on the button branch', () => {
    render(<Button disabled>Continue</Button>);

    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });
});
