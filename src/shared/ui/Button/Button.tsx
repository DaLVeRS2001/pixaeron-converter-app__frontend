import block from 'bem-cn';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { LinkProps } from 'react-router-dom';

import './Button.scss';

type CommonButtonProps = {
  className?: string;
  variant?: 'primary' | 'secondary' | 'text' | 'danger';
  children: ReactNode;
};

type NativeButtonProps = CommonButtonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'className'> & {
    to?: never;
  };

type LinkButtonProps = CommonButtonProps &
  Omit<LinkProps, 'children' | 'className'> & {
    to: LinkProps['to'];
  };

type ButtonProps = NativeButtonProps | LinkButtonProps;

const cn = block('button');
const getClasses = (variant: CommonButtonProps['variant'], className?: string) =>
  [cn({ variant: variant ?? 'primary' }), className].filter(Boolean).join(' ');

const Button = (props: ButtonProps) => {
  if (props.to !== undefined) {
    const { children, className, variant, ...linkProps } = props;

    return (
      <Link {...linkProps} className={getClasses(variant, className)}>
        {children}
      </Link>
    );
  }

  const { children, className, variant, type = 'button', ...buttonProps } = props;

  return (
    <button {...buttonProps} className={getClasses(variant, className)} type={type}>
      {children}
    </button>
  );
};

export { Button };
