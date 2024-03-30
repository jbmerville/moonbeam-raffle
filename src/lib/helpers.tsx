import { Chain, MoonbaseAlpha, Moonriver, TransactionStatus } from '@usedapp/core';
import { utils } from 'ethers/lib/ethers';
import { ReactNode } from 'react';
import { toast } from 'react-toastify';

import EthereumIcon from '@/components/icons/EthereumIcon';
import MoonbeamIcon from '@/components/icons/MoonbeamIcon';
import MoonriverIcon from '@/components/icons/MoonriverIcon';

import { availableNetworks, chains, smartCountractAdminAddresses } from '@/config';

/**
 * Function that pauses execution
 * @param milliseconds - The amount of time to wait for, in milliseconds
 */
export async function wait(milliseconds: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, milliseconds));
}

/**
 * Function that gets the logo of supported network, if network logo doesn't exist, default to Moonbeam logo.
 * @param chainId - The network chainId
 */
export function getNetworkLogo(chainId: number, circle?: boolean): ReactNode {
  if (chainId === Moonriver.chainId) {
    if (circle) {
      return (
        <div className='flex h-6 w-6 items-center justify-center rounded-full bg-white/40'>
          <MoonriverIcon />
        </div>
      );
    }
    return <MoonriverIcon />;
  }

  if (chainId === MoonbaseAlpha.chainId) {
    return <EthereumIcon />;
  }

  // Default value
  if (circle) {
    return (
      <div className='flex h-6 w-6 items-center justify-center rounded-full bg-white/40'>
        <MoonbeamIcon />
      </div>
    );
  }
  return <MoonbeamIcon />;
}

/**
 * Function to switch netwok
 * @param network - The network to switch to
 */
export async function changeNetwork(network: Chain): Promise<void> {
  // const network = getNetworkFromChainId(chaindId);
  if (window && window.ethereum) {
    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainName: network.chainName,
            chainId: utils.hexStripZeros(utils.hexlify(network.chainId)),
            nativeCurrency: network.nativeCurrency,
            rpcUrls: [network.rpcUrl],
          },
        ],
      });
      toast.dark(`Connected to ${network.chainName}`, { type: toast.TYPE.INFO });
    } catch (error) {
      console.error(`Error connecting to ${network.chainName}`, error);
      toast.dark(`Error connecting to ${network.chainName}`, { type: toast.TYPE.ERROR });
    }
  }
}

export function getNetworkFromChainId(chaindId?: number): Chain {
  const networks = availableNetworks.filter((network) => network.chainId === chaindId);
  if (networks.length === 0) {
    return chains[MoonbaseAlpha.chainId];
  }
  return networks[0];
}

export function toastOnStatusChange(state: TransactionStatus) {
  if (state.status === 'Mining') {
    toast.dark('Transaction sent', { type: toast.TYPE.INFO });
  } else if (state.status === 'PendingSignature') {
    toast.dark('Please confirm transaction on Metamask', { type: toast.TYPE.INFO });
  } else if (state.status === 'Success') {
    toast.dark('Transaction successful', { type: toast.TYPE.INFO });
  } else if (state.status === 'Fail') {
    toast.dark(`Transaction failed with error: ${state.errorMessage}`, {
      type: toast.TYPE.ERROR,
    });
  } else if (state.status === 'Exception') {
    toast.dark(`Transaction resulted in exception: ${state.errorMessage}`, {
      type: toast.TYPE.ERROR,
    });
  }
}

export function isAccountAdmin(account?: string): boolean {
  if (account) {
    return smartCountractAdminAddresses.includes(account);
  }
  return false;
}

export function isPercentageValid(percentage: number): boolean {
  if (percentage <= 0) {
    toast.dark('Percentage should be > 0', { type: toast.TYPE.ERROR });
    return false;
  } else if (percentage >= 100) {
    toast.dark('Percentage should be < 100', { type: toast.TYPE.ERROR });
    return false;
  }
  return true;
}
