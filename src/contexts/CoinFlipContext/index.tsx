/* eslint-disable no-console */

import { Contract } from '@ethersproject/contracts';
import { TransactionState, useContractFunction, useEthers } from '@usedapp/core';
import { ethers, utils } from 'ethers';
import coinFlipArtifacts from 'hardhat/artifacts/contracts/CoinFlip.sol/CoinFlip.json';
import { CoinFlip } from 'hardhat/types';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import { isPercentageValid, toastOnStatusChange, wait } from '@/lib/helpers';

import { convertLogToFlipEvent, FlipEventType, getCoinFlipState } from '@/contexts/CoinFlipContext/utils';
import { useCurrentNetworkContext } from '@/contexts/CurrentNetwork';

import { CoinFace, CoinFlipStateType } from '@/types';

export const coinFlipAbi = new utils.Interface(coinFlipArtifacts.abi);

interface CoinFlipContextIsTransactionPendingType {
  flip: boolean;
  withdraw: boolean;
  loadFunds: boolean;
  setRoyalty: boolean;
  setMaxPoolBetRatio: boolean;
}

export interface CoinFlipContextType {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  flip: (betAmount: number, choice?: CoinFace, options?: any) => Promise<void>;
  isTransactionPending: CoinFlipContextIsTransactionPendingType;
  transactionStatus: TransactionState;
  coinFlipState: CoinFlipStateType;
  isCoinFlipStateFetching: boolean;
  lastCoinFlipResult?: FlipEventType;
  withdraw: (value: number) => Promise<void>;
  loadFunds: (value: number) => Promise<void>;
  setRoyalty: (value: number) => Promise<void>;
  setMaxPoolBetRatio: (value: number) => Promise<void>;
}

const CoinFlipContext = createContext<CoinFlipContextType>({} as CoinFlipContextType);

/*
 * Context provider that fetches the coin flip states from blockchain and facilitates sending flip transactions
 * @param children - The react children components that consume the CoinFlipContext
 */
export const CoinFlipProvider = ({ children }: { children: ReactNode }) => {
  const { account, library } = useEthers();
  const { currentNetwork } = useCurrentNetworkContext();

  const contract = useMemo(
    () => new Contract(currentNetwork.coinFlipAddress, coinFlipAbi, library) as CoinFlip,
    [library, currentNetwork.coinFlipAddress]
  );

  const { send: sendFlip, state: flipState } = useContractFunction(contract, 'flip');
  const { send: sendWithdraw, state: withdrawState } = useContractFunction(contract, 'withdraw');
  const { send: sendLoadFunds, state: loadFundsState } = useContractFunction(contract, 'loadFunds');
  const { send: sendSetRoyalty, state: setRoyaltyState } = useContractFunction(contract, 'setRoyalty');
  const { send: sendSetMaxPoolBetRatio, state: setMaxPoolBetRatioState } = useContractFunction(
    contract,
    'setMaxPoolBetRatio'
  );

  const transactionStatus = flipState.status || withdrawState;
  const [isTransactionPending, setIsTransactionPending] = useState<CoinFlipContextIsTransactionPendingType>({
    flip: false,
    withdraw: false,
    loadFunds: false,
    setRoyalty: false,
    setMaxPoolBetRatio: false,
  });
  const [isCoinFlipStateFetching, setIsCoinFlipStateFetching] = useState<boolean>(false);
  const [lastCoinFlipResult, setLastCoinFlipResult] = useState<FlipEventType | undefined>();

  const [coinFlipState, setCoinFlipState] = useState<CoinFlipStateType>({
    totalFlips: 0,
    totalVolume: 0,
    contractBalance: 0,
    royalty: 0,
    maxPoolBetRatio: 0,
    maxPoolBetAmount: 0,
    owner: 'ERROR',
  });

  const refreshState = useCallback(async () => {
    try {
      if (!contract) {
        console.error('CoinFlip contract undefined');
        return;
      }
      if (!library) {
        console.error('CoinFlip library undefined');
        return;
      }
      setIsCoinFlipStateFetching(true);
      const coinFlipState = await getCoinFlipState(contract, library);
      setCoinFlipState(coinFlipState);
    } catch (error) {
      console.error('Something went wrong while fetching coinflip state', error);
    } finally {
      setIsCoinFlipStateFetching(false);
    }
  }, [contract, library]);

  useEffect(() => {
    refreshState();
  }, [refreshState]);

  useEffect(() => {
    toastOnStatusChange(flipState);
    toastOnStatusChange(withdrawState);
    toastOnStatusChange(loadFundsState);
    toastOnStatusChange(setRoyaltyState);
    toastOnStatusChange(setMaxPoolBetRatioState);
  }, [flipState, withdrawState, loadFundsState, setRoyaltyState, setMaxPoolBetRatioState]);

  const flip = useCallback(
    async (betAmount: number, choice?: CoinFace) => {
      if (choice === undefined) {
        toast.dark('No coin face selected. Select either heads or tails', { type: toast.TYPE.ERROR });
        return;
      }

      if (!account) {
        toast.dark('Please login to MetaMask', { type: toast.TYPE.ERROR });
        return;
      }

      const price = ethers.utils.parseEther(betAmount.toString());
      const playerChoice = choice === CoinFace.HEADS;

      try {
        setIsTransactionPending((transaction) => ({ ...transaction, flip: true }));

        const result = await sendFlip(playerChoice, { value: price, gasLimit: 10000000 });
        if (result === undefined) {
          return;
        }

        if (result.logs.length > 0) {
          const flipEvent = convertLogToFlipEvent(result.logs[0]);
          setLastCoinFlipResult(flipEvent);
        } else {
          toast.dark('Error reading transaction result', { type: toast.TYPE.ERROR });
        }

        // Wait 1s for changes to propagate to the blockchain
        await wait(1_000);
        await refreshState();
      } catch (error) {
        toast.dark('Something went wrong', { type: toast.TYPE.ERROR });
        console.error('Something went wrong', error);
        return;
      } finally {
        setIsTransactionPending((transaction) => ({ ...transaction, flip: false }));
      }
    },
    [account, sendFlip, refreshState]
  );

  const withdraw = useCallback(
    async (value: number) => {
      try {
        setIsTransactionPending((transaction) => ({ ...transaction, withdraw: true }));

        await sendWithdraw(ethers.utils.parseEther(value.toString()), {
          gasLimit: 500000,
        });
        await refreshState();
      } catch (error) {
        toast.dark('Something went wrong', { type: toast.TYPE.ERROR });
        console.error('Something went wrong', error);
      } finally {
        setIsTransactionPending((transaction) => ({ ...transaction, withdraw: false }));
      }
    },
    [sendWithdraw, refreshState]
  );

  const loadFunds = useCallback(
    async (value: number) => {
      try {
        setIsTransactionPending((transaction) => ({ ...transaction, loadFunds: true }));

        await sendLoadFunds({ value: ethers.utils.parseEther(value.toString()), gasLimit: 500000 });
        await refreshState();
      } catch (error) {
        toast.dark('Something went wrong', { type: toast.TYPE.ERROR });
        console.error('Something went wrong', error);
      } finally {
        setIsTransactionPending((transaction) => ({ ...transaction, loadFunds: false }));
      }
    },
    [sendLoadFunds, refreshState]
  );

  const setRoyalty = useCallback(
    async (value: number) => {
      try {
        setIsTransactionPending((transaction) => ({ ...transaction, setRoyalty: true }));

        if (isPercentageValid(value)) {
          await sendSetRoyalty(value * 10);
          await refreshState();
        }
      } catch (error) {
        toast.dark('Something went wrong', { type: toast.TYPE.ERROR });
        console.error('Something went wrong', error);
      } finally {
        setIsTransactionPending((transaction) => ({ ...transaction, setRoyalty: false }));
      }
    },
    [sendSetRoyalty, refreshState]
  );

  const setMaxPoolBetRatio = useCallback(
    async (value: number) => {
      try {
        setIsTransactionPending((transaction) => ({ ...transaction, setMaxPoolBetRatio: true }));

        if (isPercentageValid(value)) {
          await sendSetMaxPoolBetRatio(value * 10);
          await refreshState();
        }
      } catch (error) {
        toast.dark('Something went wrong', { type: toast.TYPE.ERROR });
        console.error('Something went wrong', error);
      } finally {
        setIsTransactionPending((transaction) => ({ ...transaction, setMaxPoolBetRatio: false }));
      }
    },
    [sendSetMaxPoolBetRatio, refreshState]
  );

  return (
    <CoinFlipContext.Provider
      value={{
        flip,
        isTransactionPending,
        coinFlipState,
        transactionStatus,
        isCoinFlipStateFetching,
        lastCoinFlipResult,
        withdraw,
        loadFunds,
        setRoyalty,
        setMaxPoolBetRatio,
      }}
    >
      {children}
    </CoinFlipContext.Provider>
  );
};

export const useCoinFlipContext = () => useContext(CoinFlipContext);

export default CoinFlipContext;
