/* eslint-disable @typescript-eslint/no-explicit-any */
import { shortenAddress } from '@usedapp/core';
import React, { useEffect, useState } from 'react';

import {
  getRaffleTransactionHistory,
  RaffleTransactionType,
  renderMiniatureSelectedRaffleTicket,
  renderTransactionPrice,
} from '@/components/pages/raffle/utils';
import Table from '@/components/Table';
import { TableRowType } from '@/components/Table/TableRow';

import { useCurrentNetworkContext } from '@/contexts/CurrentNetwork';
import { useRaffleContext } from '@/contexts/RaffleContext';

import { RaffleTicketType } from '@/types';

const RaffleLastSalesTable = () => {
  const [transactions, setTransactions] = useState<RaffleTransactionType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { currentNetwork } = useCurrentNetworkContext();

  const { raffleState } = useRaffleContext();

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      const raffleTransactionHistory = await getRaffleTransactionHistory(
        currentNetwork.explorerApiEndpoint,
        currentNetwork.raffleAddress
      );
      setTransactions(raffleTransactionHistory);
      setIsLoading(false);
    };

    fetchHistory();
  }, [raffleState.ticketsBought.length, currentNetwork]); // Refresh when some tickets have been bought

  const renderRowsFromTransaction = (): TableRowType<any>[] => {
    return transactions.map((transaction: RaffleTransactionType) => ({
      inputs: [
        {
          value: transaction.date,
          transformation: (value: Date) => value.toLocaleString(),
          transformationMobile: (value: Date) => value.toLocaleDateString(),
        },
        { value: transaction.address, transformation: shortenAddress },
        {
          value: transaction.ticketsBought,
          transformation: (value: RaffleTicketType[]) => (
            <div className='flex w-[220px] items-center justify-center overflow-hidden pl-5'>
              {value.map(renderMiniatureSelectedRaffleTicket)}
            </div>
          ),
          transformationMobile: (value: RaffleTicketType[]) => value.length,
        },
        {
          value: transaction.price,
          transformation: (value: string) => renderTransactionPrice(value, currentNetwork.network.chainId),
        },
      ],
      url: currentNetwork.network.getExplorerTransactionLink(transaction.hash),
    }));
  };

  return (
    <Table
      title='Last Tickets Sold'
      header={{
        inputs: [{ value: 'Date' }, { value: 'Address' }, { value: 'Tickets Bought' }, { value: 'Price' }],
      }}
      transactions={renderRowsFromTransaction()}
      isLoading={isLoading}
      emptyRowMessage='No transactions found'
    ></Table>
  );
};

export default RaffleLastSalesTable;
