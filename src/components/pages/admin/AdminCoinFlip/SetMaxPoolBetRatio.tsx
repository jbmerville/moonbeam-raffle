import React, { useState } from 'react';

import InfoCard, { InfoCardPropsType } from '@/components/InfoCards/InfoCard';
import InputForm from '@/components/pages/admin/InputForm';
import SideText from '@/components/pages/admin/SideText';

import { useCoinFlipContext } from '@/contexts/CoinFlipContext';
import { useCurrentNetworkContext } from '@/contexts/CurrentNetwork';

const SetMaxPoolBetRatio = () => {
  const { coinFlipState, setMaxPoolBetRatio, isCoinFlipStateFetching, isTransactionPending, transactionStatus } =
    useCoinFlipContext();
  const { colorAccent, currentNetwork } = useCurrentNetworkContext();
  const [value, setValue] = useState(0);

  const coinFlipBalanceCard: InfoCardPropsType = {
    title: <div>{coinFlipState.maxPoolBetRatio.toFixed(2)} %</div>,

    subtitle: <>Max Pool Bet Ratio</>,
    isLoading: isCoinFlipStateFetching,
  };

  const isDisabled = value <= 0 || value >= 100;

  const computeNewMaxBetAmount = () => {
    return coinFlipState.contractBalance * value * 0.01;
  };

  return (
    <div className='flex w-full flex-col items-center md:grid  md:grid-cols-3 md:grid-rows-1 md:gap-5'>
      <InfoCard {...coinFlipBalanceCard} className='mb-4 w-full md:mb-0' />
      <InputForm
        setValue={setValue}
        isDisabled={isDisabled}
        value={value}
        actionText='Set Max Pool Bet Ratio'
        isTransactionPending={isTransactionPending.setMaxPoolBetRatio}
        transactionStatus={transactionStatus}
        onClick={() => setMaxPoolBetRatio(value)}
        placeholder='0%'
      />
      <SideText
        topMessage={
          <>
            Change max pool bet ratio for the{' '}
            <span className={`text-${colorAccent}`}>{currentNetwork.network.chainName}</span> coin flip
          </>
        }
        bottomMessage={{
          level: 'INFO',
          message:
            value === 0 ? (
              <>
                The max pool ratio determines the max bet amount allowed, based on the smart contract balance.{' '}
                {coinFlipState.maxPoolBetRatio.toFixed(2)} % &rarr; currrent max bet amount ={' '}
                {coinFlipState.maxPoolBetAmount.toFixed(2)}.
              </>
            ) : (
              <>
                New max bet amount with this max pool ratio: {computeNewMaxBetAmount()} {currentNetwork.currencySymbol}.
              </>
            ),
        }}
      />
    </div>
  );
};

export default SetMaxPoolBetRatio;
