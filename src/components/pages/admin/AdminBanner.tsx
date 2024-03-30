import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { shortenAddress } from '@usedapp/core';
import React from 'react';

import useIsMobile from '@/hooks/useIsMobile';

import UnderlineLink from '@/components/links/UnderlineLink';

import { smartCountractAdminAddresses } from '@/config';
import { useCurrentNetworkContext } from '@/contexts/CurrentNetwork';

interface AdminBannerPropsType {
  owner: string;
  address: string;
}

const AdminBanner = (props: AdminBannerPropsType) => {
  const { owner, address } = props;
  const isMobile = useIsMobile();
  const { currentNetwork } = useCurrentNetworkContext();

  const renderAddress = (value: string): string => {
    try {
      return isMobile ? shortenAddress(value) : value;
    } catch {
      return '';
    }
  };

  return (
    <div
      className='mb-4  inline-block w-full rounded-lg bg-moonbeam-grey p-4 text-xs text-moonbase-alpha-accent md:text-sm'
      role='alert'
    >
      <FontAwesomeIcon icon={faInfoCircle} size='sm' className='mr-2 mt-1 inline w-[13px] text-moonbase-alpha-accent' />

      <span className='font-medium'>
        This contract address is{' '}
        <UnderlineLink href={currentNetwork.network.getExplorerAddressLink(address)} className='text-white/80'>
          {renderAddress(address)}
        </UnderlineLink>{' '}
        and is owned by{' '}
        <UnderlineLink href={currentNetwork.network.getExplorerAddressLink(owner)} className='text-white/80'>
          {renderAddress(owner)}
        </UnderlineLink>
        .
      </span>
      <p>
        <span className='font-medium'>
          The following addresses are considered admins (are allowed to execute functions bellow):
        </span>
        <ul className='mt-1.5 ml-4 list-inside list-disc  '>
          {smartCountractAdminAddresses.map((adminAddress) => (
            <li key={adminAddress}>
              {' '}
              <UnderlineLink href={currentNetwork.network.getExplorerAddressLink(address)} className='text-white/80'>
                {renderAddress(adminAddress)}
              </UnderlineLink>
            </li>
          ))}
        </ul>
      </p>
    </div>
  );
};

export default AdminBanner;
