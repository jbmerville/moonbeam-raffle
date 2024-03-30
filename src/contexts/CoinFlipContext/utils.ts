import { BigNumber, providers, utils } from 'ethers/lib/ethers';
import { CoinFlip } from 'hardhat/types';

import { coinFlipAbi } from '@/contexts/CoinFlipContext';

import { CoinFace, CoinFlipStateType } from '@/types';

export interface FlipEventType {
  draw: CoinFace;
  player: string;
  betAmount: BigNumber;
  playerChoice: CoinFace;
  transactionHash: string;
}

/*
 * Get coin flip states from the coin flip smart-contract by querying proxy
 * @param coinFlipContract - The coin flip object derived from smart-contract abi
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getCoinFlipState(coinFlipContract: CoinFlip, library: any): Promise<CoinFlipStateType> {
  const [totalVolumeData, totalFlipsData, contractBalanceData, royaltyData, maxPoolBetRatioData, owner] =
    await Promise.all([
      coinFlipContract.totalVolume(),
      coinFlipContract.roundId(),
      library.getBalance(coinFlipContract.address),
      coinFlipContract.royalty(),
      coinFlipContract.maxPoolBetRatio(),
      coinFlipContract.owner(),
    ]);

  const totalVolume = parseFloat(utils.formatEther(totalVolumeData));
  const totalFlips = totalFlipsData.toNumber();
  const contractBalance = parseFloat(utils.formatEther(contractBalanceData));
  const royalty = royaltyData / 10; // Ex: 50  -> 5% royalty
  const maxPoolBetRatio = maxPoolBetRatioData / 10;
  const maxPoolBetAmount = (contractBalance * maxPoolBetRatio) / 100; // Ex: 250 -> 25% maxPoolBetRatio, meaning that the max tx amount = 1/4 of total pool.

  return {
    totalVolume,
    totalFlips,
    contractBalance,
    royalty,
    maxPoolBetAmount,
    owner,
    maxPoolBetRatio,
  };
}

/*
 * Get coin flip outcome from a transaction log
 * @param log - A coin flip "Flip" log event
 */
export function convertLogToFlipEvent(log: providers.Log): FlipEventType {
  const flipEvent = coinFlipAbi.decodeEventLog('Flip', log.data).round;
  return {
    ...flipEvent,
    draw: flipEvent.draw ? CoinFace.HEADS : CoinFace.TAILS,
    playerChoice: flipEvent.playerChoice ? CoinFace.HEADS : CoinFace.TAILS,
    transactionHash: log.transactionHash,
  } as FlipEventType;
}
