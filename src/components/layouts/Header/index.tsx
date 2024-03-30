/* eslint-disable unused-imports/no-unused-vars */
import { faEllipsis } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { shortenAddress, useEthers } from '@usedapp/core';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useState } from 'react';

import useIsMobile from '@/hooks/useIsMobile';

import Button from '@/components/buttons/Button';
import MetaMaskIcon from '@/components/icons/MetaMaskIcon';
import BetaBanner from '@/components/layouts/BetaBanner';
import HeaderLink from '@/components/layouts/Header/HeaderLink';
import HeaderNetworkSelect from '@/components/layouts/Header/HeaderNetworkSelect';
import { LinkType } from '@/components/layouts/Layout';

import moonvegasLogo from '../../../../public/images/moonvegas-logo.png';

const REFERRAL = '1YCYB8B5';

interface HeaderProps {
  isMobileSideBarOpen: boolean;
  toggleMobileSideBar: () => void;
  links: LinkType[];
}

export default function Header(props: HeaderProps) {
  const { isMobileSideBarOpen, toggleMobileSideBar, links } = props;

  const { account, deactivate, activateBrowserWallet } = useEthers();
  const { asPath } = useRouter();
  const [isShowCopiedReferral, setIsShowCopiedReferral] = useState(false);
  const isMobile = useIsMobile();

  const connectToNetwork = async () => {
    await activateBrowserWallet();
  };

  const onReferralClicked = () => {
    setIsShowCopiedReferral(true);
    navigator.clipboard.writeText(REFERRAL);
    setTimeout(() => setIsShowCopiedReferral(false), 1000);
  };

  return (
    <header className='fixed top-0 z-50 w-full bg-moonbeam-grey md:sticky'>
      <div className='layout z-50 flex items-center justify-start py-1 md:py-1'>
        <div className='flex w-full items-center justify-start'>
          <div className='relative my-2 h-[50px] w-[70px] items-center justify-center duration-75	md:h-[50px] md:w-[120px]'>
            <Image src={moonvegasLogo} layout='fill' objectFit='contain' alt='' />
          </div>
          {!isMobile && links.map((link) => <HeaderLink key={link.url} link={link} />)}
        </div>
        {!isMobile && <HeaderNetworkSelect className='mr-4 w-max' />}
        {account ? (
          <>
            {/* <Button
              variant='dark'
              className='lg-2 relative mr-2 hidden  overflow-hidden md:block'
              onClick={onReferralClicked}
            >
              <p className='z-1 relative'>{REFERRAL}</p>
              <p
                className={`z-2 absolute top-0 left-0 bg-gray-800 p-2 px-8 text-orange transition duration-300 ${
                  isShowCopiedReferral ? 'opacity-100' : 'opacity-0'
                }`}
              >
                Copied!
              </p>
            </Button> */}
            <Button onClick={deactivate}>
              <MetaMaskIcon />
              <p>{shortenAddress(account)}</p>
            </Button>
          </>
        ) : (
          <div className='flex w-fit justify-between '>
            {/* <Button variant='dark' className='lg-2 hidden md:block'>
              <p>Have a referral?</p>
            </Button> */}
            <Button className='w-max' onClick={connectToNetwork}>
              <MetaMaskIcon />
              <p className='text-sm md:text-base'>Connect MetaMask</p>
            </Button>
          </div>
        )}
        <div
          onClick={toggleMobileSideBar}
          className='ml-2 w-fit cursor-pointer items-center rounded-lg p-2 text-base font-normal text-white hover:bg-gray-700 md:hidden'
        >
          <FontAwesomeIcon
            icon={faEllipsis}
            size='xl'
            className={`mx-2 h-10 w-6 text-xs text-gray-500 md:mx-1 md:w-6 ${
              isMobileSideBarOpen ? 'rotate-0' : 'rotate-90'
            } transition`}
          />
        </div>
      </div>
      <BetaBanner />
    </header>
  );
}
