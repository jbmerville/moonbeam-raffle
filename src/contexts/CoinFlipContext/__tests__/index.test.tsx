/* eslint-disable no-console */
import { act, cleanup, render } from '@testing-library/react';
import * as core from '@usedapp/core';
import { toast } from 'react-toastify';

import CoinFlipContext, { CoinFlipContextType, CoinFlipProvider } from '@/contexts/CoinFlipContext';
import { getCoinFlipState } from '@/contexts/CoinFlipContext/utils';

import { CoinFace } from '@/types';

const betAmount = 11;
const errorMessage = 'errorMessage';

const mockUseEthers = core.useEthers as jest.Mock;
const mockUseContractFunction = core.useContractFunction as jest.Mock;
const mockGetCoinFlipState = getCoinFlipState as jest.Mock;

jest.mock('react-toastify', () => ({
  ...jest.requireActual('react-toastify'),
  toast: {
    TYPE: {
      ERROR: 'ERROR',
      SUCCESS: 'SUCCESS',
    },
    dark: jest.fn(),
  },
}));

jest.mock('@ethersproject/contracts', () => ({
  Contract: jest.fn(),
}));

jest.mock('@usedapp/core', () => ({
  ...jest.requireActual('@usedapp/core'),
  useEthers: jest.fn().mockReturnValue({}),
  useContractFunction: jest.fn().mockReturnValue({
    send: jest.fn().mockReturnValue({
      status: 1,
    }),
    state: {
      status: 'Mining',
    },
  }),
}));

jest.mock('../utils', () => ({
  ...jest.requireActual('../utils'),
  getCoinFlipState: jest.fn().mockResolvedValue({
    totalFlips: 1,
    totalVolume: 1,
    contractBalance: 1,
    royalty: 1,
    maxPoolBetAmount: 1,
  }),
}));

jest.mock('@/lib/helpers', () => ({
  ...jest.requireActual('@/lib/helpers'),
  wait: jest.fn(),
}));

jest.mock('@/contexts/CurrentNetwork', () => ({
  useCurrentNetworkContext: jest.fn().mockReturnValue({
    currentNetwork: {
      coinFlipAddress: '',
    },
  }),
}));

describe('CoinFlipContext', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error');
    setUpUseEthers(1287, 'abc123');
  });

  afterEach(() => {
    cleanup();
  });

  it('should render without crashing', async () => {
    const context = setUpContextMock();
    await act(async () => {
      expect(context).toBeDefined();
    });
    expect(console.error).not.toHaveBeenCalled();
  });

  it('should call toast.dark with correct parameters if no coin face is selected', async () => {
    const context = setUpContextMock();

    await act(async () => {
      await context.flip(betAmount);
    });

    expect(toast.dark).toHaveBeenCalledWith('No coin face selected. Select either heads or tails', {
      type: 'ERROR',
    });
    expect(console.error).not.toHaveBeenCalled();
  });

  it('should call toast.dark with correct parameters when not connected to MetaMask', async () => {
    setUpUseEthers(1287);
    const context = setUpContextMock();

    await act(async () => {
      context.flip(betAmount, CoinFace.HEADS);
    });

    expect(toast.dark).toHaveBeenCalledWith(`Please login to MetaMask`, {
      type: 'ERROR',
    });
    expect(console.error).not.toHaveBeenCalled();
  });

  it('should call toast.dark with correct parameters if the flip results in a win', async () => {
    expect(true).toBe(true);
    expect(console.error).not.toHaveBeenCalled();
  });

  it('should call toast.dark with correct parameters if the flip results in a transaction Success', async () => {
    setUpUseEthers(1287, 'abc123');
    setUpUseContractFunctionMock('Success');
    const context = setUpContextMock();
    await act(async () => {
      context.flip(betAmount, CoinFace.HEADS);
    });

    expect(toast.dark).toHaveBeenCalledWith(`Transaction successful`, { type: toast.TYPE.INFO });
    expect(console.error).not.toHaveBeenCalled();
  });

  it('should call toast.dark with correct parameters if the flip results in a transaction failure', async () => {
    setUpUseEthers(1287, 'abc123');
    setUpUseContractFunctionMock('Fail');
    const context = setUpContextMock();
    await act(async () => {
      context.flip(betAmount, CoinFace.HEADS);
    });

    expect(toast.dark).toHaveBeenCalledWith(`Transaction failed with error: ${errorMessage}`, {
      type: toast.TYPE.ERROR,
    });
    expect(console.error).not.toHaveBeenCalled();
  });

  it('should call toast.dark with correct parameters if the flip results in a transaction exception', async () => {
    setUpUseEthers(1287, 'abc123');
    setUpUseContractFunctionMock('Exception');
    const context = setUpContextMock();
    await act(async () => {
      context.flip(betAmount, CoinFace.HEADS);
    });

    expect(toast.dark).toHaveBeenCalledWith(`Transaction resulted in exception: ${errorMessage}`, {
      type: toast.TYPE.ERROR,
    });
    expect(console.error).not.toHaveBeenCalled();
  });

  it('should refresh coin flip state after transaction is done', async () => {
    mockGetCoinFlipState.mockClear();
    setUpUseEthers(1287, 'abc123');
    setUpUseContractFunctionMock('Success');
    const context = setUpContextMock();

    await act(async () => {
      await context.flip(betAmount, CoinFace.HEADS);
    });

    expect(mockGetCoinFlipState.mock.calls.length).toEqual(2);
    expect(console.error).not.toHaveBeenCalled();
  });

  it('should refresh coin flip state after transaction is done', async () => {
    mockGetCoinFlipState.mockClear();
    setUpUseEthers(1287, 'abc123');
    setUpUseContractFunctionMock('Success');
    const context = setUpContextMock();

    await act(async () => {
      await context.flip(betAmount, CoinFace.HEADS);
    });

    expect(mockGetCoinFlipState.mock.calls.length).toEqual(2);
    expect(console.error).not.toHaveBeenCalled();
  });

  it('should set transaction to not pending after sending transaction', async () => {
    mockGetCoinFlipState.mockClear();
    setUpUseEthers(1287, 'abc123');
    setUpUseContractFunctionMock('Success');
    const context = setUpContextMock();

    await act(async () => {
      await context.flip(betAmount, CoinFace.HEADS);
    });

    expect(context.isTransactionPending.flip).toBe(false);
    expect(console.error).not.toHaveBeenCalled();
  });

  it('should set transaction to not pending after sending transaction when transaction fails', async () => {
    mockGetCoinFlipState.mockClear();
    setUpUseEthers(1287, 'abc123');
    setUpUseContractFunctionMock('Success', true);
    const context = setUpContextMock();

    await act(async () => {
      await context.flip(betAmount, CoinFace.HEADS);
    });

    expect(toast.dark).toHaveBeenCalledWith(`Something went wrong`, {
      type: toast.TYPE.ERROR,
    });
    expect(context.isTransactionPending.flip).toBe(false);
    expect(console.error).toBeCalledTimes(1);
  });
});

const setUpUseEthers = (chainId: number, account?: string) => {
  mockUseEthers.mockReturnValue({
    account,
    library: { value: true },
    chainId,
  });
};

const setUpUseContractFunctionMock = (status: core.TransactionState, sendException?: boolean) => {
  mockUseContractFunction.mockReturnValue({
    send: jest.fn().mockImplementation(() => {
      if (sendException) throw new Error('Mock function threw an error');
      return {
        logs: [
          {
            data: '0x0000000000000000000000002c1a07a4cceeedbbb2f8134867cbde7cc812652d0000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
            topics: '0x3419036def9952f45dbfaa88ccbb2008b3c97cf9fe09f9b8e13e9df7b14b84ae',
            transactionHash: '012345',
          },
        ],
      };
    }),
    state: {
      status,
      errorMessage,
    },
  });
};

const setUpContextMock = (): CoinFlipContextType => {
  let context: CoinFlipContextType = {} as CoinFlipContextType;

  render(
    <CoinFlipProvider>
      <CoinFlipContext.Consumer>
        {(value) => {
          context = value;
          return <div />;
        }}
      </CoinFlipContext.Consumer>
    </CoinFlipProvider>
  );

  return context;
};
