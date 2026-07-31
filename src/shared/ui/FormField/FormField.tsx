import block from 'bem-cn';
import { InputHTMLAttributes, ReactNode, forwardRef } from 'react';

import { Input } from 'shared/ui/Input';

import './FormField.scss';

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: ReactNode;
};

const cn = block('form-field');

const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ id, label, error, hint, ...props }, ref) => {
    return (
      <label className={cn()} htmlFor={id}>
        <span className={cn('label')}>{label}</span>
        <Input ref={ref} id={id} invalid={Boolean(error)} {...props} />
        {error ? (
          <span className={cn('message', { error: true })} role="alert">
            <span aria-hidden="true">⚠</span>
            {error}
          </span>
        ) : hint ? (
          <span className={cn('message')}>{hint}</span>
        ) : null}
      </label>
    );
  }
);

FormField.displayName = 'FormField';

export { FormField };
