import React, { useState } from 'react';

import InfoCard, { InfoCardPropsType } from '@/components/InfoCards/InfoCard';
import InputForm from '@/components/pages/admin/InputForm';
import SideText from '@/components/pages/admin/SideText';

import { useCurrentNetworkContext } from '@/contexts/CurrentNetwork';
import { useRaffleContext } from '@/contexts/RaffleContext';

const SetRoyaltyRaffle = () => {
  const { raffleState, setRoyalty, isRaffleStateFetching, isTransactionPending, transactionStatus } =
    useRaffleContext();
  const { colorAccent, currentNetwork } = useCurrentNetworkContext();
  const [value, setValue] = useState(0);

  const coinFlipBalanceCard: InfoCardPropsType = {
    title: <div>{raffleState.royalty.toFixed(2)} %</div>,

    subtitle: <>Royalties</>,
    isLoading: isRaffleStateFetching,
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
        isTransactionPending={isTransactionPending}
        transactionStatus={transactionStatus}
        onClick={() => setRoyalty(value)}
        placeholder='0%'
      />
      <SideText
        topMessage={
          <>
            Change royalty for the <span className={`text-${colorAccent}`}>{currentNetwork.network.chainName}</span>{' '}
            raffle
          </>
        }
        bottomMessage={{
          level: 'INFO',
          message: <>Royalties are sent to the owner account at the end of every raffle.</>,
        }}
      />
    </div>
  );
};

export default SetRoyaltyRaffle;
