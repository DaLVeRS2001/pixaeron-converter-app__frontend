import block from 'bem-cn';
import type { ReactNode } from 'react';

import ChevronLeftIcon from 'shared/assets/icons/chevron-left.svg';
import ChevronRightIcon from 'shared/assets/icons/chevron-right.svg';
import { SVG } from 'shared/ui/SVG';

import './Pagination.scss';

type PaginationProps = {
  page: number;
  pages: number;
  onChange: (page: number) => void;
  label: string;
  previousLabel: string;
  nextLabel: string;
  summary?: ReactNode;
  className?: string;
};

type PageItem = number | 'gap';

const COMPACT_LIMIT = 7;

const pageItems = (page: number, pages: number): PageItem[] => {
  if (pages <= COMPACT_LIMIT) return Array.from({ length: pages }, (_, index) => index);

  const shown = [...new Set([0, page - 1, page, page + 1, pages - 1])]
    .filter((candidate) => candidate >= 0 && candidate < pages)
    .sort((left, right) => left - right);
  const items: PageItem[] = [];
  let previous = -1;
  for (const candidate of shown) {
    if (candidate - previous === 2) items.push(previous + 1);
    else if (candidate - previous > 2) items.push('gap');
    items.push(candidate);
    previous = candidate;
  }

  return items;
};

const cn = block('pagination');

const Pagination = ({
  page,
  pages,
  onChange,
  label,
  previousLabel,
  nextLabel,
  summary,
  className,
}: PaginationProps) => (
  <nav className={cn.mix(className)} aria-label={label}>
    {summary && <p className={cn('summary')}>{summary}</p>}
    {pages > 1 && (
      <ul className={cn('list')}>
        <li>
          <button
            type="button"
            className={cn('control')}
            aria-label={previousLabel}
            disabled={page === 0}
            onClick={() => onChange(page - 1)}
          >
            <SVG Svg={ChevronLeftIcon} className={cn('icon').toString()} />
          </button>
        </li>
        {pageItems(page, pages).map((item, index) =>
          item === 'gap' ? (
            <li key={`gap-${index}`} className={cn('gap')} aria-hidden="true">
              …
            </li>
          ) : (
            <li key={item}>
              <button
                type="button"
                className={cn('control', { current: item === page })}
                aria-current={item === page ? 'page' : undefined}
                onClick={() => onChange(item)}
              >
                {item + 1}
              </button>
            </li>
          )
        )}
        <li>
          <button
            type="button"
            className={cn('control')}
            aria-label={nextLabel}
            disabled={page >= pages - 1}
            onClick={() => onChange(page + 1)}
          >
            <SVG Svg={ChevronRightIcon} className={cn('icon').toString()} />
          </button>
        </li>
      </ul>
    )}
  </nav>
);

export { Pagination, pageItems };
export type { PaginationProps };
