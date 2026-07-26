import block from 'bem-cn';
import { ButtonHTMLAttributes } from 'react';
import { Link, To } from 'react-router-dom';

import './Button.scss';

type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  to?: To;
  variant?: 'primary' | 'secondary' | 'text' | 'danger';
  children: React.ReactNode;
};

const cn = block('button');

const Button = ({
  className,
  variant = 'primary',
  to,
  children,
  type = 'button',
  ...props
}: ButtonProps) => {
  const classes = [cn({ variant }), className].filter(Boolean).join(' ');

  if (to) {
    return (
      <Link className={classes} to={to}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} type={type} {...props}>
      {children}
    </button>
  );
};

export { Button };
