import { faWarning } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { MoonbaseAlpha, TransactionState } from '@usedapp/core';
import React from 'react';

import UnderlineLink from '@/components/links/UnderlineLink';

import { useCurrentNetworkContext } from '@/contexts/CurrentNetwork';

interface TransactionWarningMessagePropsType {
  transactionStatus: TransactionState;
  className?: string;
}
const TransactionWarningMessage = (props: TransactionWarningMessagePropsType) => {
  const { transactionStatus, className } = props;
  const { currentNetwork } = useCurrentNetworkContext();
  const isCurrentNetworkMoonbaseAlpha = currentNetwork.network.chainId === MoonbaseAlpha.chainId;
  const isTransactionMining = transactionStatus === 'Mining';

  const getWarningMessage = () => {
    if (isTransactionMining) {
      return 'Transactions can take up to 60s.';
    }
    if (isCurrentNetworkMoonbaseAlpha) {
      return (
        <p>
          Get DEV tokens at the{' '}
          <UnderlineLink href='https://apps.moonbeam.network/moonbase-alpha/faucet/'>
            Moonbase Alpha faucet
          </UnderlineLink>
          .
        </p>
      );
    }
  };

  if (!isTransactionMining && !isCurrentNetworkMoonbaseAlpha) {
    return <></>;
  }

  return (
    <div className={`flex text-sm text-amber-400 ${className} `}>
      <FontAwesomeIcon icon={faWarning} size='xs' className='mr-2 w-[13px]' />
      {getWarningMessage()}
    </div>
  );
};

export default TransactionWarningMessage;
