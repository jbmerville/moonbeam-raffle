/* eslint-disable @typescript-eslint/no-explicit-any */
import { shortenAddress } from '@usedapp/core';
import React, { useEffect, useState } from 'react';

import CoinImage from '@/components/pages/coinflip/CoinFlipFaceSelection/CoinImage';
import {
  CoinFlipTransactionType,
  getCoinFlipTransactionHistory,
  getOutcomeCoinFace,
  getTransactionsWithOutcome,
} from '@/components/pages/coinflip/utils';
import Table from '@/components/Table';
import { TableRowType } from '@/components/Table/TableRow';

import { useCurrentNetworkContext } from '@/contexts/CurrentNetwork';

import { CoinFace, ExplorerTransactionType } from '@/types';

const CoinFlipLastSalesTable = () => {
  const [transactions, setTransactions] = useState<ExplorerTransactionType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { currentNetwork, colorAccent } = useCurrentNetworkContext();

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      const transactionHistory = await getCoinFlipTransactionHistory(
        currentNetwork.explorerApiEndpoint,
        currentNetwork.coinFlipAddress
      );
      setTransactions(transactionHistory);
      setIsLoading(false);
    };

    fetchHistory();
  }, [currentNetwork]);

  const renderRowsFromTransaction = async (transactions: ExplorerTransactionType[]): Promise<TableRowType<any>[]> => {
    const transactionsWithOutcome = await getTransactionsWithOutcome(
      transactions,
      currentNetwork.rpcUrl,
      currentNetwork.coinFlipAddress
    );

    return transactionsWithOutcome.map((transaction) => ({
      inputs: [
        {
          value: transaction.date,
          transformation: (value: Date) => value.toLocaleString(),
          transformationMobile: (value: Date) => value.toLocaleDateString(),
        },
        { value: transaction.address, transformation: shortenAddress },
        {
          value: transaction,
          transformation: (value: CoinFlipTransactionType) => {
            return (
              <div>
                {value.isWin ? (
                  <span className='uppercase text-green-400'>Doubled</span>
                ) : (
                  <span className='uppercase text-red-500'>Lost</span>
                )}{' '}
                {value.price} <span className={`uppercase text-${colorAccent}`}>{currentNetwork.currencySymbol}</span>
              </div>
            );
          },
        },
        {
          value: transaction.choice,
          transformation: (value: CoinFace) => {
            return <CoinImage coinFace={value} height={40} width={40} />;
          },
          transformationMobile: (value: CoinFace) => {
            return <CoinImage coinFace={value} height={25} width={25} />;
          },
        },
        {
          value: transaction,
          transformation: (value: CoinFlipTransactionType) => {
            return <CoinImage coinFace={getOutcomeCoinFace(value)} height={40} width={40} />;
          },
          transformationMobile: (value: CoinFlipTransactionType) => {
            return <CoinImage coinFace={getOutcomeCoinFace(value)} height={25} width={25} />;
          },
        },
      ],
      url: currentNetwork.network.getExplorerTransactionLink(transaction.hash),
    }));
  };

  return (
    <Table
      title='Last Coin Flips'
      header={{
        inputs: [
          { value: 'Date' },
          { value: 'Address' },
          { value: 'Result' },
          { value: 'Choice' },
          { value: 'Outcome' },
        ],
      }}
      transactions={transactions}
      renderRowsFromTransaction={renderRowsFromTransaction}
      emptyRowMessage='No transactions for this coin flip yet.'
      isLoading={isLoading}
    />
  );
};

export default CoinFlipLastSalesTable;
