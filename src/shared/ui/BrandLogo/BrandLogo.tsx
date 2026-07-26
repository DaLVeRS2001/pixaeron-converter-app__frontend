import block from 'bem-cn';

import './BrandLogo.scss';

type BrandLogoProps = {
  light?: boolean;
  compact?: boolean;
  large?: boolean;
};

const cn = block('brand-logo');

const BrandLogo = ({ light = false, compact = false, large = false }: BrandLogoProps) => {
  return (
    <span className={cn({ light, compact, large })} aria-label="Pixaeron">
      <svg className={cn('mark')} viewBox="0 0 28 28" aria-hidden="true">
        <path d="M24.5 3.7 3.8 11.5c-1 .4-1 1.8.1 2.1l7.4 2.1 2.1 7.4c.3 1.1 1.8 1.1 2.2.1l7.7-17.9c.5-1.1-.6-2.1-1.6-1.7l-7.9 10.2-4.6-1.3L24.5 3.7Z" />
      </svg>
      {!compact && <span className={cn('name')}>Pixaeron</span>}
    </span>
  );
};

export { BrandLogo };
