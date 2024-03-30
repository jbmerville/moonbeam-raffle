import { TableRowType } from '@/components/Table/TableRow';

import { PAGINATION_BUTTON_COUNT, PAGINATION_BUTTON_COUNT_MOBILE } from '@/constants/env';

type PageRowsMapType = Map<number, TableRowType<any>[]>;

export const putPageRowsMap = (pageRowsMap: PageRowsMapType, key: number, value: TableRowType<any>) => {
  if (pageRowsMap.get(key) !== undefined) {
    pageRowsMap.get(key)?.push(value);
  } else {
    pageRowsMap.set(key, [value]);
  }
};

export const getPagesAroundPage = (pageRowsMap: PageRowsMapType, pageNumber: number, isMobile: boolean): number[] => {
  const pageRowsMapKeys = Array.from(pageRowsMap.keys());
  const paginationButtonCount = isMobile ? PAGINATION_BUTTON_COUNT_MOBILE : PAGINATION_BUTTON_COUNT;
  const halfPaginationButtonCount = ~~(paginationButtonCount / 2);

  let lowerBound = Math.max(pageNumber - halfPaginationButtonCount, 0);
  let upperBound = Math.min(pageNumber + halfPaginationButtonCount, pageRowsMapKeys.length);
  let missingPages = paginationButtonCount - (upperBound - lowerBound);

  // Pad pages if current page number is too close to edges (0 or pageRowsMapKeys.length)
  lowerBound = Math.max(lowerBound - missingPages, 0);
  missingPages = paginationButtonCount - (upperBound - lowerBound);
  upperBound = Math.min(upperBound + missingPages, pageRowsMapKeys.length);

  return pageRowsMapKeys.slice(lowerBound, upperBound);
};
