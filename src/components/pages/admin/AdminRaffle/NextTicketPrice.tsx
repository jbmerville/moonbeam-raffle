import { utils } from 'ethers/lib/ethers';
import React, { useState } from 'react';

import InfoCard, { InfoCardPropsType } from '@/components/InfoCards/InfoCard';
import InputForm from '@/components/pages/admin/InputForm';
import SideText from '@/components/pages/admin/SideText';

import { useCurrentNetworkContext } from '@/contexts/CurrentNetwork';
import { useRaffleContext } from '@/contexts/RaffleContext';

const NextTicketPrice = () => {
  const { raffleState, setRoyalty, isRaffleStateFetching, isTransactionPending, transactionStatus } =
    useRaffleContext();
  const { colorAccent, currentNetwork } = useCurrentNetworkContext();
  const [value, setValue] = useState(0);

  const coinFlipBalanceCard: InfoCardPropsType = {
    title: (
      <div>
        {parseFloat(utils.formatEther(raffleState.ticketPrice))} {currentNetwork.currencySymbol} -{' '}
        {parseFloat(utils.formatEther(raffleState.ticketPrice))} {currentNetwork.currencySymbol}
      </div>
    ),

    subtitle: <>Current Ticket Price - Next Ticket Price</>,
    isLoading: isRaffleStateFetching,
  };

  const isDisabled = value <= 0;

  return (
    <div className='flex w-full flex-col items-center md:grid  md:grid-cols-3 md:grid-rows-1 md:gap-5'>
      <InfoCard {...coinFlipBalanceCard} className='mb-4 w-full md:mb-0' />
      <InputForm
        setValue={setValue}
        isDisabled={isDisabled}
        value={value}
        actionText='Set Next Ticket Price'
        isTransactionPending={isTransactionPending}
        transactionStatus={transactionStatus}
        onClick={setRoyalty}
        placeholder={`0 ${currentNetwork.currencySymbol}`}
      />
      <SideText
        topMessage={
          <>
            Change next ticket price for the{' '}
            <span className={`text-${colorAccent}`}>{currentNetwork.network.chainName}</span> raffle
          </>
        }
        bottomMessage={{
          level: 'INFO',
          message: <>Next ticket price is applied for once the raffle is restarted.</>,
        }}
      />
    </div>
  );
};

export default NextTicketPrice;
