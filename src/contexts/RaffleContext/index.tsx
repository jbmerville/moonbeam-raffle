/* eslint-disable no-console */

import { Contract } from '@ethersproject/contracts';
import { TransactionState, useContractFunction, useEthers } from '@usedapp/core';
import { BigNumber, utils } from 'ethers';
import raffleArtifacts from 'hardhat/artifacts/contracts/Raffle.sol/Raffle.json';
import { Raffle } from 'hardhat/types';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import { isPercentageValid, toastOnStatusChange } from '@/lib/helpers';

import { getNonDefaultRaffleSelectedTickets } from '@/components/pages/raffle/utils';

import { useCurrentNetworkContext } from '@/contexts/CurrentNetwork';
import { getRaffleState } from '@/contexts/RaffleContext/utils';

import { RaffleStateType, RaffleTicketType } from '@/types';

export const raffleAbi = new utils.Interface(raffleArtifacts.abi);

export interface RaffleContextType {
  purchase: (tickets: RaffleTicketType[], resetTicketsSelected: () => void) => Promise<void>;
  isTransactionPending: boolean;
  transactionStatus: TransactionState;
  raffleState: RaffleStateType;
  isRaffleStateFetching: boolean;
  endRaffle: () => Promise<void>;
  setRoyalty: (value: number) => Promise<void>;
}

const RaffleContext = createContext<RaffleContextType>({} as RaffleContextType);

/*
 * Context provider that fetches the raffle states from blockchain and facilitates sending raffle tickets purchase transactions
 * @param children - The react children components that consume the RaffleContext
 */
export const RaffleProvider = ({ children }: { children: ReactNode }) => {
  const { account, library } = useEthers();
  const { currentNetwork } = useCurrentNetworkContext();

  const contract = useMemo(
    () => new Contract(currentNetwork.raffleAddress, raffleAbi, library) as Raffle,
    [library, currentNetwork.raffleAddress]
  );

  const { send: sendPurchase, state: purchaseState } = useContractFunction(contract, 'purchase');
  const { send: sendEndRaffle, state: endRafflesState } = useContractFunction(contract, 'endRaffleAdmin');
  const { send: sendSetRoyalty, state: setRoyaltyState } = useContractFunction(contract, 'setRoyalty');

  const transactionStatus = purchaseState.status;
  const [isTransactionPending, setIsTransactionPending] = useState<boolean>(false);
  const [isRaffleStateFetching, setIsRaffleStateFetching] = useState<boolean>(false);

  const [raffleState, setRaffleState] = useState<RaffleStateType>({
    tickets: [],
    ticketsLeft: [],
    ticketsBought: [],
    ticketPrice: BigNumber.from(0),
    draftTime: new Date(),
    raffleHistory: [],
    maxTicketAmount: 0,
    royalty: 0,
    contractBalance: 0,
    owner: 'ERROR',
  });

  const refreshState = useCallback(async () => {
    try {
      if (!contract) {
        console.error('Raffle contract undefined');
        return;
      }
      if (!library) {
        console.error('library undefined');
        return;
      }
      setIsRaffleStateFetching(true);
      const raffleState = await getRaffleState(contract, library);
      setRaffleState(raffleState);
    } catch (error) {
      console.error('Something went wrong while fetching raffle state', error);
    } finally {
      setIsRaffleStateFetching(false);
    }
  }, [contract, library]);

  useEffect(() => {
    refreshState();
  }, [refreshState, currentNetwork.raffleAddress]);

  useEffect(() => {
    toastOnStatusChange(purchaseState);
    toastOnStatusChange(endRafflesState);
    toastOnStatusChange(setRoyaltyState);
  }, [endRafflesState, purchaseState, setRoyaltyState]);

  const purchase = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (tickets: RaffleTicketType[], resetTicketsSelected: () => void) => {
      const ticketIds = getNonDefaultRaffleSelectedTickets(tickets).map((ticket) => ticket.id);
      if (ticketIds.length === 0) {
        toast.dark('No ticket selected', { type: toast.TYPE.ERROR });
        return;
      }

      if (!account) {
        toast.dark('Please login to MetaMask', { type: toast.TYPE.ERROR });
        console.error(`Account not found`);
        return;
      }

      const price = raffleState.ticketPrice.mul(ticketIds.length);

      try {
        setIsTransactionPending(true);

        const result = await sendPurchase(ticketIds, { value: price, gasLimit: 500000 });

        if (result === undefined) {
          return;
        }
        if (result.status === 1) {
          // Wait 1s for changes to propagate to the blockchain
          await new Promise((resolve) => setTimeout(resolve, 1000));
          await refreshState();
          resetTicketsSelected();
        }
      } catch (error) {
        toast.dark('Something went wrong', { type: toast.TYPE.ERROR });
        console.error('Something went wrong', error);
      } finally {
        setIsTransactionPending(false);
      }
    },
    [account, raffleState.ticketPrice, sendPurchase, refreshState]
  );

  const endRaffle = useCallback(async () => {
    try {
      setIsTransactionPending(true);

      await sendEndRaffle();
      await refreshState();
    } catch (error) {
      toast.dark('Something went wrong', { type: toast.TYPE.ERROR });
      console.error('Something went wrong', error);
    } finally {
      setIsTransactionPending(false);
    }
  }, [sendEndRaffle, refreshState]);

  const setRoyalty = useCallback(
    async (value: number) => {
      try {
        setIsTransactionPending(true);

        if (isPercentageValid(value)) {
          await sendSetRoyalty(value * 10);
          await refreshState();
        }
      } catch (error) {
        toast.dark('Something went wrong', { type: toast.TYPE.ERROR });
        console.error('Something went wrong', error);
      } finally {
        setIsTransactionPending(false);
      }
    },
    [sendSetRoyalty, refreshState]
  );

  return (
    <RaffleContext.Provider
      value={{
        setRoyalty,
        purchase,
        isTransactionPending,
        raffleState,
        transactionStatus,
        isRaffleStateFetching,
        endRaffle,
      }}
    >
      {children}
    </RaffleContext.Provider>
  );
};

export const useRaffleContext = () => useContext(RaffleContext);

export default RaffleContext;
