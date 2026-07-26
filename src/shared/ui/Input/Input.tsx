import block from 'bem-cn';
import { InputHTMLAttributes, forwardRef } from 'react';

import './Input.scss';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

const cn = block('input');

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid = false, ...props }, ref) => {
    const classes = [cn({ invalid }), className].filter(Boolean).join(' ');

    return <input ref={ref} className={classes} aria-invalid={invalid} {...props} />;
  }
);

Input.displayName = 'Input';

export { Input };
