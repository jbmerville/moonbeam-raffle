import React, { useState } from 'react';

import InfoCard, { InfoCardPropsType } from '@/components/InfoCards/InfoCard';
import AddWithdrawForm from '@/components/pages/admin/AdminCoinFlip/AddWithdrawForm';
import SideText from '@/components/pages/admin/SideText';

import { useCoinFlipContext } from '@/contexts/CoinFlipContext';
import { useCurrentNetworkContext } from '@/contexts/CurrentNetwork';

const AddWithdraw = () => {
  const { coinFlipState, isCoinFlipStateFetching } = useCoinFlipContext();
  const { colorAccent, currentNetwork } = useCurrentNetworkContext();
  const [value, setValue] = useState(0);

  const coinFlipBalanceCard: InfoCardPropsType = {
    title: (
      <div>
        {coinFlipState.contractBalance.toFixed(2)} {currentNetwork.currencySymbol}
      </div>
    ),

    subtitle: <>Smart Contract Balance</>,
    isLoading: isCoinFlipStateFetching,
  };

  const computeNewMaxBetAmount = (value: number, isAdding: boolean): string => {
    if (isAdding) {
      return ((coinFlipState.contractBalance + value) / 4).toFixed(2);
    }
    return ((coinFlipState.contractBalance - value) / 4).toFixed(2);
  };

  return (
    <div className='flex w-full flex-col items-center md:grid  md:grid-cols-3 md:grid-rows-1 md:gap-5'>
      <InfoCard {...coinFlipBalanceCard} className='mb-4 w-full md:mb-0' />
      <AddWithdrawForm setValue={setValue} value={value} />
      <SideText
        topMessage={
          <>
            Add or remove {currentNetwork.currencySymbol} from the{' '}
            <span className={`text-${colorAccent}`}>{currentNetwork.network.chainName}</span> coin flip
          </>
        }
        bottomMessage={{
          level: 'INFO',
          message:
            value === 0 ? (
              <>
                This will impact the max bet amount allowed for this smart contract. Currently the max bet is{' '}
                {coinFlipState.maxPoolBetAmount.toFixed(2)} {currentNetwork.currencySymbol}.
              </>
            ) : (
              <>
                New max bet amount after adding: {computeNewMaxBetAmount(value, true)} {currentNetwork.currencySymbol},
                removing: {computeNewMaxBetAmount(value, false)} {currentNetwork.currencySymbol}, currently:{' '}
                {coinFlipState.maxPoolBetAmount.toFixed(2)} {currentNetwork.currencySymbol}. Removing sends the funds to
                the owner (multisig contract)
              </>
            ),
        }}
      />
    </div>
  );
};

export default AddWithdraw;
