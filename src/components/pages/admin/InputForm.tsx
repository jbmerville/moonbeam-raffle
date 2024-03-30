import { TransactionState } from '@usedapp/core';
import React from 'react';

import Button from '@/components/buttons/Button';
import Loading from '@/components/icons/Loading';
import { parseTransactionStatus } from '@/components/pages/coinflip/utils';

import { useCurrentNetworkContext } from '@/contexts/CurrentNetwork';

interface InputFormPropsType {
  setValue: (value: number) => void;
  value: number;
  actionText: string;
  isTransactionPending: boolean;
  isDisabled: boolean;
  transactionStatus: TransactionState;
  onClick: (value: number) => Promise<void>;
  placeholder: string;
}
const InputForm = (props: InputFormPropsType) => {
  const { setValue, isDisabled, isTransactionPending, transactionStatus, onClick, actionText, placeholder } = props;
  const { colorAccent, colorAccentText } = useCurrentNetworkContext();

  return (
    <div className='flex h-full w-full flex-col'>
      <div className='h-full w-full'>
        <input
          onChange={(event: any) => setValue(parseFloat(event.target.value) || 0)}
          type='number'
          id='first_name'
          className={`block w-full rounded-lg border-2 border-${colorAccent} focus:ring-white-500 bg-moonbeam-grey-dark pl-4 text-white md:p-2.5  md:text-xl`}
          placeholder={placeholder}
          min='0'
          max='100'
        />
      </div>
      {isTransactionPending ? (
        <Button disabled={isTransactionPending} className='mt-4'>
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
        <Button disabled={isDisabled} onClick={onClick} className='mt-4 flex w-full justify-center'>
          <div className={`uppercase md:text-xl text-${colorAccentText}`}>{actionText}</div>
        </Button>
      )}
    </div>
  );
};

export default InputForm;
