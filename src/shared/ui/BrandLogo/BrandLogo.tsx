import block from 'bem-cn';

import BrandMark from 'shared/assets/icons/brand-mark.svg';
import { SVG } from 'shared/ui/SVG';

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
      <SVG Svg={BrandMark} className={cn('mark').toString()} aria-hidden="true" />
      {!compact && <span className={cn('name')}>Pixaeron</span>}
    </span>
  );
};

export { BrandLogo };
