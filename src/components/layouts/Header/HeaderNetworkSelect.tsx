import { Chain } from '@usedapp/core';
import React, { useState } from 'react';

import { getNetworkFromChainId, getNetworkLogo } from '@/lib/helpers';

import Button from '@/components/buttons/Button';

import { availableNetworks } from '@/config';
import { useCurrentNetworkContext } from '@/contexts/CurrentNetwork';

interface HeaderNetworkSelectPropsType {
  className?: string;
}
const HeaderNetworkSelect = (props: HeaderNetworkSelectPropsType) => {
  const { className } = props;
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const { currentNetwork, changeNetwork, colorAccent } = useCurrentNetworkContext();

  const handleChangeNetwork = async (network: Chain) => {
    changeNetwork(network.chainId);
  };

  const renderNonCurrentAvailableNetworks = () => {
    return availableNetworks
      .filter((network) => network.chainId !== currentNetwork.network.chainId)
      .map((network) => {
        return (
          <li
            className='m-0 border-t-2 border-moonbeam-grey p-0 hover:bg-moonbeam-grey'
            key={network.chainId}
            onClick={() => handleChangeNetwork(network)}
          >
            <div className='flex items-center justify-center p-2 '>{renderNetwork(network)}</div>
          </li>
        );
      });
  };

  const renderNetwork = (network: Chain) => {
    return (
      <div className='flex w-max items-center justify-center'>
        {getNetworkLogo(network.chainId)}
        <p className='ml-2 flex w-max'>{network.chainName}</p>
      </div>
    );
  };

  return (
    <div className={`flex w-max ${className}`}>
      <Button
        variant='outline'
        className='flex w-[190px] items-center justify-center'
        onMouseEnter={() => setIsSelectOpen(true)}
        onMouseLeave={() => setIsSelectOpen(false)}
      >
        {renderNetwork(getNetworkFromChainId(currentNetwork.network.chainId))}
      </Button>
      {isSelectOpen && (
        <div
          className={`absolute z-10 mt-[37px] box-border w-[190px] rounded-b border-2 border-t-0 py-[3px] md:mt-[40px] border-${colorAccent} bg-moonbeam-grey-dark`}
          onMouseEnter={() => setIsSelectOpen(true)}
          onMouseLeave={() => setIsSelectOpen(false)}
        >
          <ul className='cursor-pointer text-gray-200'>{renderNonCurrentAvailableNetworks()}</ul>
        </div>
      )}
    </div>
  );
};

export default HeaderNetworkSelect;
