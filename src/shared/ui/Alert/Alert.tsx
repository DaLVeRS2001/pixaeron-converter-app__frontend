import block from 'bem-cn';
import type { ReactNode } from 'react';

import './Alert.scss';

type AlertProps = {
  variant: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  children: ReactNode;
};

const cn = block('alert');

const symbols = {
  success: '✓',
  error: '!',
  warning: '▲',
  info: 'i',
} as const;

const Alert = ({ variant, title, children }: AlertProps) => {
  return (
    <div className={cn({ variant })} role={variant === 'error' ? 'alert' : 'status'}>
      <span className={cn('icon')} aria-hidden="true">
        {symbols[variant]}
      </span>
      <div className={cn('body')}>
        {title && <strong className={cn('title')}>{title}</strong>}
        <div className={cn('content')}>{children}</div>
      </div>
    </div>
  );
};

export { Alert };
