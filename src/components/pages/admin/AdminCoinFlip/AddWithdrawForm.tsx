import React from 'react';

import Button from '@/components/buttons/Button';
import Loading from '@/components/icons/Loading';
import { parseTransactionStatus } from '@/components/pages/coinflip/utils';

import { useCoinFlipContext } from '@/contexts/CoinFlipContext';
import { useCurrentNetworkContext } from '@/contexts/CurrentNetwork';

interface AddWithdrawFormPropsType {
  setValue: (value: number) => void;
  value: number;
}
const AddWithdrawForm = (props: AddWithdrawFormPropsType) => {
  const { setValue, value } = props;
  const { currentNetwork, colorAccent, colorAccentText } = useCurrentNetworkContext();
  const { coinFlipState, withdraw, isTransactionPending, transactionStatus, loadFunds } = useCoinFlipContext();

  const computeNewMaxBetAmount = (value: number, isAdding: boolean): number => {
    if (isAdding) {
      return (coinFlipState.contractBalance + value) / 4;
    }
    return (coinFlipState.contractBalance - value) / 4;
  };

  const isWithdrawDisabled = value == 0 || computeNewMaxBetAmount(value, false) <= 0;
  const isAddDisabled = value <= 0;

  const onAddFundsClicked = async () => {
    await loadFunds(value);
    await setValue(0);
  };

  const onWithdrawFundsClicked = async () => {
    await withdraw(value);
    await setValue(0);
  };

  return (
    <div className='flex h-full w-full flex-col'>
      <div className='h-full w-full'>
        <input
          onChange={(event: any) => setValue(parseFloat(event.target.value) || 0)}
          type='number'
          id='first_name'
          className={`block w-full rounded-lg border-2 border-${colorAccent} focus:ring-white-500 bg-moonbeam-grey-dark pl-4 text-white md:p-2.5  md:text-xl`}
          placeholder={`0 ${currentNetwork.currencySymbol}`}
          min='1'
        />
      </div>
      {isTransactionPending.withdraw || isTransactionPending.loadFunds ? (
        <Button disabled={isAddDisabled} className='mt-4'>
          <div className='flex w-full items-center justify-center'>
            <div className='mr-2'>
              <Loading />
            </div>
            <span className=' mt-1 font-extrabold uppercase text-white'>
              {parseTransactionStatus(transactionStatus)}...
            </span>
          </div>
        </Button>
      ) : (
        <div className='mt-4 flex w-full'>
          <Button disabled={isAddDisabled} onClick={onAddFundsClicked} className='flex w-full justify-center'>
            <div className={`uppercase md:text-xl text-${colorAccentText}`}>Add</div>
          </Button>
          <Button
            disabled={isWithdrawDisabled}
            onClick={onWithdrawFundsClicked}
            className='ml-4 flex w-full justify-center'
          >
            <div className={`uppercase md:text-xl text-${colorAccentText}`}>Remove</div>
          </Button>
        </div>
      )}
    </div>
  );
};

export default AddWithdrawForm;
