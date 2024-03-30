import React, { useState } from 'react';

import InfoCard, { InfoCardPropsType } from '@/components/InfoCards/InfoCard';
import InputForm from '@/components/pages/admin/InputForm';
import SideText from '@/components/pages/admin/SideText';

import { useCoinFlipContext } from '@/contexts/CoinFlipContext';
import { useCurrentNetworkContext } from '@/contexts/CurrentNetwork';

const SetRoyaltyCoinFlip = () => {
  const { coinFlipState, setRoyalty, isCoinFlipStateFetching, isTransactionPending, transactionStatus } =
    useCoinFlipContext();
  const { colorAccent, currentNetwork } = useCurrentNetworkContext();
  const [value, setValue] = useState(0);

  const coinFlipBalanceCard: InfoCardPropsType = {
    title: <div>{coinFlipState.royalty.toFixed(2)} %</div>,

    subtitle: <>Royalties</>,
    isLoading: isCoinFlipStateFetching,
  };

  const isDisabled = value <= 0 || value >= 100;

  return (
    <div className='flex w-full flex-col items-center md:grid  md:grid-cols-3 md:grid-rows-1 md:gap-5'>
      <InfoCard {...coinFlipBalanceCard} className='mb-4 w-full md:mb-0' />
      <InputForm
        setValue={setValue}
        isDisabled={isDisabled}
        value={value}
        actionText='Set Royalty'
        isTransactionPending={isTransactionPending.setRoyalty}
        transactionStatus={transactionStatus}
        onClick={() => setRoyalty(value)}
        placeholder='0%'
      />
      <SideText
        topMessage={
          <>
            Change royalty for the <span className={`text-${colorAccent}`}>{currentNetwork.network.chainName}</span>{' '}
            coin flip
          </>
        }
        bottomMessage={{
          level: 'INFO',
          message: (
            <>
              This will impact the how fast the pool is filled up. Royalties are sent every winning transactions to the
              owner account.
            </>
          ),
        }}
      />
    </div>
  );
};

export default SetRoyaltyCoinFlip;
