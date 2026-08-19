import block from 'bem-cn';
import type { ReactNode } from 'react';

import CircleAlertIcon from 'shared/assets/icons/circle-alert.svg';
import CircleCheckIcon from 'shared/assets/icons/circle-check.svg';
import CircleInfoIcon from 'shared/assets/icons/circle-info.svg';
import TriangleAlertIcon from 'shared/assets/icons/triangle-alert.svg';
import { SVG } from 'shared/ui/SVG';

import './Alert.scss';

type AlertProps = {
  variant: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  children: ReactNode;
};

const cn = block('alert');

const VARIANT_ICON = {
  success: CircleCheckIcon,
  error: CircleAlertIcon,
  warning: TriangleAlertIcon,
  info: CircleInfoIcon,
} as const;

const Alert = ({ variant, title, children }: AlertProps) => {
  return (
    <div className={cn({ variant })} role={variant === 'error' ? 'alert' : 'status'}>
      <SVG Svg={VARIANT_ICON[variant]} className={cn('icon').toString()} />
      <div className={cn('body')}>
        {title && <strong className={cn('title')}>{title}</strong>}
        <div className={cn('content')}>{children}</div>
      </div>
    </div>
  );
};

export { Alert };
