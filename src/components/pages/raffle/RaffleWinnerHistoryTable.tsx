/* eslint-disable @typescript-eslint/no-explicit-any */
import { shortenAddress } from '@usedapp/core';
import React from 'react';

import { renderMiniatureSelectedRaffleTicket, renderTransactionPrice } from '@/components/pages/raffle/utils';
import Table from '@/components/Table';
import { TableRowType } from '@/components/Table/TableRow';

import { useCurrentNetworkContext } from '@/contexts/CurrentNetwork';
import { useRaffleContext } from '@/contexts/RaffleContext';

import { RaffleTicketType } from '@/types';

export interface TransactionType {
  address: string;
  date: Date;
  ticketsBought: RaffleTicketType[];
  price: string;
  hash: string;
  block: string;
}

const RaffleWinnerHistoryTable = () => {
  const { raffleState, isRaffleStateFetching } = useRaffleContext();
  const { currentNetwork } = useCurrentNetworkContext();

  const renderRowsFromTransaction = (): TableRowType<any>[] => {
    return raffleState.raffleHistory.map((history) => ({
      inputs: [
        {
          value: history.winner,
          transformation: shortenAddress,
        },
        {
          value: history.ticketPrice * history.totalTickets,
          transformation: (value: number) => renderTransactionPrice(value, currentNetwork.network.chainId),
        },
        {
          value: { id: history.winningTicket, isSelected: false },
          transformation: renderMiniatureSelectedRaffleTicket,
          transformationMobile: (value: RaffleTicketType) => value.id,
        },
        {
          value: history.totalTickets,
        },
      ],
    }));
  };

  return (
    <Table
      title='Winner History'
      header={{
        inputs: [{ value: 'Address' }, { value: 'Winnings' }, { value: 'Winning Ticket' }, { value: 'Total Tickets' }],
      }}
      isLoading={isRaffleStateFetching}
      transactions={renderRowsFromTransaction()}
      emptyRowMessage='No raffle winners yet.'
    ></Table>
  );
};

export default RaffleWinnerHistoryTable;
