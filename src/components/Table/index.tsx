/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';

import useIsMobile from '@/hooks/useIsMobile';

import TablePaginationButton from '@/components/Table/TablePaginationButton';
import TableRow, { TableRowType } from '@/components/Table/TableRow';

import { TicketType } from '@/types';

export interface TransactionType {
  address: string;
  date: Date;
  ticketsBought: TicketType[];
  price: string;
  hash: string;
  block: string;
}

interface TablePropsType<T> {
  title: string;
  header: TableRowType<T>;
  rows: TableRowType<T>[];
  emptyRowMessage: string;
}

const PAGINATION_BUTTON_COUNT = 10;
const PAGINATION_BUTTON_COUNT_MOBILE = 5;

const Table = (props: TablePropsType<any>) => {
  const { rows, header, emptyRowMessage, title } = props;
  const isMobile = useIsMobile();
  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const pageNumberToRows = new Map<number, TableRowType<any>[]>();

  const putPageNumberToRows = (key: number, value: TableRowType<any>) => {
    if (pageNumberToRows.get(key) !== undefined) {
      pageNumberToRows.get(key)?.push(value);
    } else {
      pageNumberToRows.set(key, [value]);
    }
  };

  const getPageNumberKeysAroundCurrentPageNumber = (): number[] => {
    const pageNumberToRowsKeys = Array.from(pageNumberToRows.keys());
    const paginationButtonCount = isMobile ? PAGINATION_BUTTON_COUNT_MOBILE : PAGINATION_BUTTON_COUNT;
    const halfPaginationButtonCount = ~~(paginationButtonCount / 2);
    const isHalfPaginationButtonCountEven = halfPaginationButtonCount % 2 === 0;
    const lowerBound = Math.max(
      currentPageNumber - halfPaginationButtonCount - (isHalfPaginationButtonCountEven ? 1 : 0),
      0
    );
    const upperBound = Math.min(currentPageNumber + halfPaginationButtonCount, pageNumberToRowsKeys.length);

    return pageNumberToRowsKeys.slice(lowerBound, upperBound);
  };

  rows.forEach((row, index) => putPageNumberToRows(~~(index / 10) + 1, row));

  return (
    <div className='layout my-6 flex flex-col items-start justify-between md:mt-10 md:mb-10'>
      <div className='mb-1 flex w-full items-center md:mb-3'>
        <p className='text-center text-xl font-bold text-moonbeam-cyan md:text-3xl'>{title}</p>
      </div>
      <table className='h-full w-full	table-auto border-spacing-0 overflow-hidden	rounded-t-lg text-sm'>
        <thead className=' bg-[#0c0e11]'>
          <TableRow row={header} />
        </thead>
        <tbody className='text-lg'>
          {rows.length === 0 || pageNumberToRows.get(currentPageNumber) === undefined ? (
            <tr className=' box-border flex h-full w-full grow items-center justify-center border-b-[0.5px] border-[#474d57] py-5'>
              <td>{emptyRowMessage}</td>
            </tr>
          ) : (
            pageNumberToRows.get(currentPageNumber)?.map((row, i) => <TableRow key={i} row={row} />)
          )}
        </tbody>
      </table>

      <div className='mt-6 flex w-full justify-end'>
        {getPageNumberKeysAroundCurrentPageNumber().map((pageNumber) => (
          <TablePaginationButton
            key={pageNumber}
            pageNumber={pageNumber}
            isCurrentPageNumber={pageNumber === currentPageNumber}
            setCurrentPageNumber={setCurrentPageNumber}
          />
        ))}
      </div>
    </div>
  );
};

export default Table;
