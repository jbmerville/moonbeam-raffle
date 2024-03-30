/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';

import useIsMobile from '@/hooks/useIsMobile';

import Loading from '@/components/icons/Loading';
import TablePaginationButton from '@/components/Table/TablePaginationButton';
import TableRow, { TableRowType } from '@/components/Table/TableRow';
import { getPagesAroundPage, putPageRowsMap } from '@/components/Table/utils';

import { useCurrentNetworkContext } from '@/contexts/CurrentNetwork';

import { RaffleTicketType } from '@/types';

export interface TransactionType {
  address: string;
  date: Date;
  ticketsBought: RaffleTicketType[];
  price: string;
  hash: string;
  block: string;
}

interface TablePropsType<T> {
  title: string;
  header: TableRowType<T>;
  transactions: any[];
  emptyRowMessage: string;
  renderRowsFromTransaction?: (rows: T[]) => Promise<TableRowType<T>[]>;
  isLoading?: boolean;
}

const Table = (props: TablePropsType<any>) => {
  const { transactions, header, emptyRowMessage, title, renderRowsFromTransaction, isLoading } = props;
  const isMobile = useIsMobile();
  const [isLoadingInternal, setIsLoadingInternal] = useState<boolean>(false);
  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const [pageRowsMap, setPageRowsMap] = useState(new Map<number, TableRowType<any>[]>());
  const [currentPageRows, setCurrentPageRows] = useState<TableRowType<any>[]>([]);
  const { colorAccent } = useCurrentNetworkContext();

  const refreshPageRowsMap = () => {
    const newPageRowsMap = new Map<number, TableRowType<any>[]>();
    transactions.forEach((transaction, index) => putPageRowsMap(newPageRowsMap, ~~(index / 10) + 1, transaction));
    setPageRowsMap(newPageRowsMap);
  };

  const refreshCurrentPageRows = async () => {
    await setIsLoadingInternal(true);
    if (pageRowsMap.get(currentPageNumber) !== undefined && renderRowsFromTransaction) {
      const loadRows = async () => {
        const newRows = await renderRowsFromTransaction(pageRowsMap.get(currentPageNumber) as any[]);
        setCurrentPageRows(newRows);
      };
      await loadRows();
    }
    await setIsLoadingInternal(false);
  };

  const isEmptyRow = currentPageRows.length === 0;
  const isAnythingLoading = isLoading || isLoadingInternal;

  useEffect(() => {
    refreshPageRowsMap();
    refreshCurrentPageRows();
  }, [transactions]);

  useEffect(() => {
    refreshCurrentPageRows();
  }, [currentPageNumber]);

  return (
    <div className='layout my-6 mb-12 flex flex-col items-start justify-between md:mt-10 md:mb-16'>
      <div className='mb-2 flex w-full items-center md:mb-3'>
        <p className='text-center text-xl font-bold text-white md:text-3xl'>{title}</p>
      </div>
      <table className='h-full w-full	table-auto border-spacing-0 overflow-hidden	rounded-t-lg text-sm'>
        <thead className=' bg-[#0c0e11]'>
          <TableRow row={header} />
        </thead>
        <tbody className='text-lg' data-cy='table-body'>
          {!isEmptyRow && !isAnythingLoading && currentPageRows.map((row, i) => <TableRow key={i} row={row} />)}
        </tbody>
      </table>
      {(isAnythingLoading || isEmptyRow) && (
        <div className=' box-border flex h-full w-full grow items-center justify-center border-b-[0.5px] border-[#474d57] py-5 text-sm md:text-base'>
          {isAnythingLoading ? <Loading /> : emptyRowMessage}
        </div>
      )}
      <div className='mt-6 flex w-full justify-end'>
        {getPagesAroundPage(pageRowsMap, currentPageNumber, isMobile).map((pageNumber) => (
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
