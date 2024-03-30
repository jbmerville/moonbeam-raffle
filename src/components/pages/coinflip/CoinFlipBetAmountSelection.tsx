import React, { useEffect, useState } from 'react';

import { getNetworkLogo } from '@/lib/helpers';
import useIsMobile from '@/hooks/useIsMobile';

import Button from '@/components/buttons/Button';
import CoinFlipBetAmountButton from '@/components/pages/coinflip/CoinFlipBetAmountButton';
import { parseTransactionStatus } from '@/components/pages/coinflip/utils';
import TransactionWarningMessage from '@/components/TransactionWarningMessage';

import { useCoinFlipContext } from '@/contexts/CoinFlipContext';
import { useCurrentNetworkContext } from '@/contexts/CurrentNetwork';

import { CoinFace } from '@/types';

interface CoinFlipBetAmountSelectionPropsType {
  playerCoinFaceChoice?: CoinFace;
}

const CoinFlipBetAmountSelection = (props: CoinFlipBetAmountSelectionPropsType) => {
  const { playerCoinFaceChoice } = props;
  const { isTransactionPending, flip, transactionStatus } = useCoinFlipContext();
  const { currentNetwork, colorAccent, colorAccentText } = useCurrentNetworkContext();
  const [currentSelectedBetAmount, setCurrentSelectedBetAmount] = useState(currentNetwork.betAmounts[0]);
  const isMobile = useIsMobile();

  const onFlipClick = () => {
    flip(currentSelectedBetAmount, playerCoinFaceChoice);
  };

  useEffect(() => {
    setCurrentSelectedBetAmount(currentNetwork.betAmounts[0]);
  }, [currentNetwork.betAmounts]);

  const getBetAmounts = () => {
    return isMobile ? currentNetwork.betAmounts : currentNetwork.betAmounts.slice(0, 8);
  };

  return (
    <div className='layout flex flex-col items-center justify-center'>
      <div className='flex w-full flex-col items-start justify-start '>
        <div className='flex w-full items-center'>
          <p className={`text-${colorAccent} text-left text-lg font-bold md:text-3xl`}>Bet Amount</p>
        </div>
        <p className={`text-${colorAccent} text-left text-sm font-light opacity-80 md:text-lg`}>
          Select a bet amount. Max bet amount is capped based on smart contract balance.
        </p>
        <div className='flex w-full flex-col items-center justify-start md:mt-4'>
          <div className='my-2 grid w-full grid-cols-3 grid-rows-3 gap-4 md:grid-cols-4 md:grid-rows-2'>
            {getBetAmounts().map((betAmount, index) => (
              <CoinFlipBetAmountButton
                betAmount={betAmount}
                key={index}
                setCurrentSelectedBetAmount={setCurrentSelectedBetAmount}
                isCurrentSelectedBetAmount={betAmount === currentSelectedBetAmount}
              />
            ))}
          </div>
          <Button
            isLoading={isTransactionPending.flip}
            className={`relative mt-2 inline-flex w-full items-center justify-center overflow-hidden rounded-md p-0.5 text-sm font-medium text-${colorAccentText} md:text-lg `}
            onClick={onFlipClick}
          >
            {isTransactionPending.flip ? (
              <span className='py-2.5 pl-2 font-extrabold uppercase text-white'>
                {parseTransactionStatus(transactionStatus)}...
              </span>
            ) : (
              <span className='relative flex w-full items-center justify-center py-2.5 font-extrabold uppercase md:px-5'>
                <div className='scale-[1.5] pr-3'>{getNetworkLogo(currentNetwork.network.chainId, true)}</div>
                <p className='text-white'>Double or Nothing</p>
              </span>
            )}
          </Button>

          <TransactionWarningMessage className='mt-3' transactionStatus={transactionStatus} />
        </div>
      </div>
    </div>
  );
};

export default CoinFlipBetAmountSelection;
