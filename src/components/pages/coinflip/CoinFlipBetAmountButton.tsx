import { useEtherBalance, useEthers } from '@usedapp/core';
import { utils } from 'ethers/lib/ethers';
import React, { useState } from 'react';
import { toast } from 'react-toastify';

import { getNetworkLogo } from '@/lib/helpers';
import useIsMobile from '@/hooks/useIsMobile';

import Button from '@/components/buttons/Button';

import { useCoinFlipContext } from '@/contexts/CoinFlipContext';
import { useCurrentNetworkContext } from '@/contexts/CurrentNetwork';

interface CoinFlipBetAmountButtonPropsType {
  betAmount: number;
  setCurrentSelectedBetAmount: (betAmount: number) => void;
  isCurrentSelectedBetAmount: boolean;
}
const CoinFlipBetAmountButton = (props: CoinFlipBetAmountButtonPropsType) => {
  const { betAmount, setCurrentSelectedBetAmount, isCurrentSelectedBetAmount } = props;
  const isMobile = useIsMobile();
  const { coinFlipState } = useCoinFlipContext();
  const { account } = useEthers();
  const { currentNetwork } = useCurrentNetworkContext();
  const accountBalance = useEtherBalance(account);
  const doesPlayerHaveInsufficiantBalanceForBet =
    accountBalance && parseFloat(utils.formatEther(accountBalance)) < betAmount;
  const doesSCHaveInsufficiantBalanceForBet = betAmount >= coinFlipState.maxPoolBetAmount;
  const [isHover, setIsHover] = useState(false);
  const isDisabled = doesSCHaveInsufficiantBalanceForBet || doesPlayerHaveInsufficiantBalanceForBet;

  const onButtonClick = () => {
    if (doesSCHaveInsufficiantBalanceForBet) {
      toast.dark(`Insufficient smart contract balance to allow this bet amount`, {
        type: toast.TYPE.WARNING,
      });
    } else if (doesPlayerHaveInsufficiantBalanceForBet) {
      toast.dark(`Insufficient ${currentNetwork.currencySymbol} balance in your account`, {
        type: toast.TYPE.WARNING,
      });
    } else {
      setCurrentSelectedBetAmount(betAmount);
    }
  };

  const renderButtonText = () => {
    if ((doesSCHaveInsufficiantBalanceForBet || doesPlayerHaveInsufficiantBalanceForBet) && isHover) {
      if (isMobile) {
        return 'Unavailable';
      }
      if (doesSCHaveInsufficiantBalanceForBet) {
        return 'Insufficient SC Balance';
      }
      return 'Insufficient Balance';
    }

    return (
      <div className={`flex items-center justify-center md:text-lg ${isDisabled && 'opacity-50'}`}>
        <div className='mr-2 scale-[1.2] md:mr-3 md:scale-[1.5]'>{getNetworkLogo(currentNetwork.network.chainId)}</div>
        {betAmount} {currentNetwork.currencySymbol}
      </div>
    );
  };

  return (
    <Button
      onMouseEnter={() => {
        setIsHover(true);
      }}
      onMouseLeave={() => {
        setIsHover(false);
      }}
      variant={isCurrentSelectedBetAmount ? 'outline' : 'primary'}
      onClick={onButtonClick}
      className={`box-border flex w-full justify-center p-1 text-sm uppercase md:p-2 md:text-base md:hover:text-base ${
        isDisabled ? 'bg-moonbeam-grey-light text-white' : 'font-bold'
      }`}
    >
      {renderButtonText()}
    </Button>
  );
};

export default CoinFlipBetAmountButton;
