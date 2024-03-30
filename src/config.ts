import { Chain, Config, MoonbaseAlpha, Moonbeam, Moonriver } from '@usedapp/core';
import coinFlipAddressLocalhost from 'hardhat/sc-addresses/localhost/CoinFlip.address.js';
import raffleAddressLocalhost from 'hardhat/sc-addresses/localhost/Raffle.address.js';
import coinFlipAddressMoonbaseAlpha from 'hardhat/sc-addresses/moonbase/CoinFlip.address.js';
import raffleAddresssMoonbaseAlpha from 'hardhat/sc-addresses/moonbase/Raffle.address.js';
import coinFlipAddressMoonbeam from 'hardhat/sc-addresses/moonbeam/CoinFlip.address.js';
import raffleAddressMoonbeam from 'hardhat/sc-addresses/moonbeam/Raffle.address';
import coinFlipAddressMoonriver from 'hardhat/sc-addresses/moonriver/CoinFlip.address.js';
import raffleAddressMoonriver from 'hardhat/sc-addresses/moonriver/Raffle.address';

import { isDev, isProd } from '@/constants/env';

export const smartCountractAdminAddresses = [
  '0x3D9F8E1602a0b0A5A398a75d6A9DaF6007530357',
  '0x2C1a07a4cCEeeDBbb2f8134867cbDe7cC812652D',
];

export const LocalhostChain: Chain = {
  chainId: 1281,
  chainName: 'Moonbeam Localhost',
  isTestChain: true,
  isLocalChain: true,
  multicallAddress: '0x0000000000000000000000000000000000000000',
  getExplorerAddressLink: (address: string) => `https://tutorialchain.etherscan.io/address/${address}`,
  getExplorerTransactionLink: (transactionHash: string) => `https://tutorialchain.etherscan.io/tx/${transactionHash}`,
  // Optional parameters:
  rpcUrl: 'http://127.0.0.1:9933',
  blockExplorerUrl: 'https://tutorialchain.etherscan.io',
  nativeCurrency: {
    name: 'GLMR',
    symbol: 'GLMR',
    decimals: 18,
  },
};

export const LocalhostConfig: Config = {
  networks: [LocalhostChain],
  readOnlyChainId: LocalhostChain.chainId,
  readOnlyUrls: {
    [LocalhostChain.chainId]: 'http://127.0.0.1:9933',
  },
};

const defaultBetAmounts = [1, 2, 5, 10, 15, 20, 30, 100, 150];

export const chains: { [key: number]: Chain } = {
  [LocalhostChain.chainId]: LocalhostChain,
  [MoonbaseAlpha.chainId]: MoonbaseAlpha,
  [Moonriver.chainId]: Moonriver,
  [Moonbeam.chainId]: Moonbeam,
};

export const chainBetAmounts: { [key: number]: number[] } = {
  [LocalhostChain.chainId]: defaultBetAmounts,
  [MoonbaseAlpha.chainId]: [0.1, 0.5, 1, 2, 5, 10, 15, 20, 50],
  [Moonriver.chainId]: [0.1, 0.5, 1, 2, 5, 10, 15, 20, 50],
  [Moonbeam.chainId]: defaultBetAmounts,
};

export const contractAddresses: { [key: number]: { raffleAddress: string; coinFlipAddress: string } } = {
  [LocalhostChain.chainId]: {
    raffleAddress: raffleAddressLocalhost,
    coinFlipAddress: coinFlipAddressLocalhost,
  },
  [MoonbaseAlpha.chainId]: {
    raffleAddress: raffleAddresssMoonbaseAlpha,
    coinFlipAddress: coinFlipAddressMoonbaseAlpha,
  },
  [Moonbeam.chainId]: {
    raffleAddress: raffleAddressMoonbeam,
    coinFlipAddress: coinFlipAddressMoonbeam,
  },
  [Moonriver.chainId]: {
    raffleAddress: raffleAddressMoonriver,
    coinFlipAddress: coinFlipAddressMoonriver,
  },
};

// These values should be found in tailwind.config.js
export const chainColorAccents: { [key: number]: string } = {
  [LocalhostChain.chainId]: 'moonbase-alpha-accent',
  [MoonbaseAlpha.chainId]: 'moonbase-alpha-accent',
  [Moonbeam.chainId]: 'moonbeam-accent',
  [Moonriver.chainId]: 'moonriver-accent',
};

export const chainColorAccentsText: { [key: number]: string } = {
  [LocalhostChain.chainId]: 'white',
  [MoonbaseAlpha.chainId]: 'white',
  [Moonbeam.chainId]: 'black',
  [Moonriver.chainId]: 'black',
};

export const availableNetworks: Chain[] = [
  chains[Moonbeam.chainId],
  chains[Moonriver.chainId],
  chains[MoonbaseAlpha.chainId],
];

export const explorerApiEndpoints: { [key: number]: string } = {
  [MoonbaseAlpha.chainId]: 'https://api-moonbase.moonscan.io/api',
  [Moonriver.chainId]: 'https://api-moonriver.moonscan.io/api',
  [Moonbeam.chainId]: 'https://api-moonbeam.moonscan.io/api',
};

export const getDefaultChainId = (): number => {
  if (isProd || isDev) {
    return Moonbeam.chainId;
  }
  return LocalhostChain.chainId;
};

// To override the currentDappConfig, set the NEXT_PUBLIC_ENV variable to "production" in .env
export const currentDappConfig: Config = {
  networks: [MoonbaseAlpha, Moonriver, Moonbeam],
  readOnlyChainId: getDefaultChainId(),
  readOnlyUrls: {
    [MoonbaseAlpha.chainId]: MoonbaseAlpha.rpcUrl as string,
    [Moonriver.chainId]: Moonriver.rpcUrl as string,
    [Moonbeam.chainId]: Moonbeam.rpcUrl as string,
  },
};

export const getDefaultChain = (): Chain => {
  return chains[getDefaultChainId()];
};

// eslint-disable-next-line no-console
console.log({
  NODE_ENV: process.env.NODE_ENV,
  currentNetwork: getDefaultChain().chainName,
});
