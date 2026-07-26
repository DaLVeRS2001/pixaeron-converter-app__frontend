import block from 'bem-cn';
import type { ComponentType, HTMLAttributes, SVGProps as ReactSVGProps } from 'react';

import './SVG.scss';

type SVGComponent = ComponentType<ReactSVGProps<SVGSVGElement>>;

interface SVGProps extends HTMLAttributes<HTMLSpanElement> {
  Svg: SVGComponent;
}

const cn = block('svg-component');

const SVG = ({ Svg, className, role, ...restProps }: SVGProps) => {
  const resolvedRole = role ?? (restProps['aria-label'] ? 'img' : undefined);

  return (
    <span className={cn.mix(className)} role={resolvedRole} {...restProps}>
      <Svg className={cn('content').toString()} aria-hidden="true" focusable="false" />
    </span>
  );
};

export { SVG };
export type { SVGProps };
