import { fireEvent, render, screen } from '@testing-library/react';

import { Pagination, pageItems } from './Pagination';

const renderPagination = (page: number, pages: number, onChange = jest.fn()) => {
  render(
    <Pagination
      page={page}
      pages={pages}
      onChange={onChange}
      label="Pages"
      previousLabel="Back"
      nextLabel="Next"
      summary="Showing 20 of 142 files"
    />
  );

  return onChange;
};

describe('pageItems', () => {
  it('lists every page while there are few of them', () => {
    expect(pageItems(2, 7)).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });

  it('keeps the ends and the neighbours of the current page, bridging gaps', () => {
    expect(pageItems(0, 24)).toEqual([0, 1, 'gap', 23]);
    expect(pageItems(3, 24)).toEqual([0, 1, 2, 3, 4, 'gap', 23]);
    expect(pageItems(11, 24)).toEqual([0, 'gap', 10, 11, 12, 'gap', 23]);
    expect(pageItems(23, 24)).toEqual([0, 'gap', 22, 23]);
  });
});

describe('Pagination', () => {
  it('marks the current page and hands over the page the user picks', () => {
    const onChange = renderPagination(0, 24);

    expect(screen.getByRole('button', { name: '1' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByText('Showing 20 of 142 files')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '24' }));

    expect(onChange).toHaveBeenCalledWith(23);
  });

  it('shows only the summary when everything fits on one page', () => {
    renderPagination(0, 1);

    expect(screen.getByText('Showing 20 of 142 files')).toBeInTheDocument();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('steps with the arrows and blocks the arrow that leads nowhere', () => {
    const onChange = renderPagination(23, 24);

    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));

    expect(onChange).toHaveBeenCalledWith(22);
  });
});
