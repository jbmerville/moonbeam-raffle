import { useEthers } from '@usedapp/core';
import * as React from 'react';
import { ToastContainer } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';

import { isAccountAdmin } from '@/lib/helpers';
import useIsMobile from '@/hooks/useIsMobile';

import Header from '@/components/layouts/Header';
import MobileSideBar from '@/components/layouts/MobileSideBar';

import { CurrentNetworkProvider } from '@/contexts/CurrentNetwork';

export interface LinkType {
  url: string;
  name: string;
  description?: string;
  isBeta?: boolean;
}

const linksWithoutAdmin: LinkType[] = [
  {
    url: '/',
    name: 'Coin Flip',
    description: '50% chance of doubling your bet',
  },
  {
    url: '/raffle',
    name: 'Raffle',
    description: '1 winning ticket wins all the funds',
    isBeta: true,
  },
];

const linkWithAdmin: LinkType[] = [
  ...linksWithoutAdmin,
  { url: '/admin', name: 'Admin', description: 'Manage smart contracts' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isMobileSideBarOpen, setIsMobileSideBarOpen] = React.useState(false);
  const toggleMobileSideBar = () => setIsMobileSideBarOpen(!isMobileSideBarOpen);
  const isMobile = useIsMobile();
  const { account } = useEthers();

  const links = isAccountAdmin(account) ? linkWithAdmin : linksWithoutAdmin;

  const toggleMobileSideBarOutsideSideBar = () => {
    if (isMobileSideBarOpen) {
      toggleMobileSideBar();
    }
  };

  return (
    <CurrentNetworkProvider>
      <div className='flex h-full w-full flex-col'>
        <Header isMobileSideBarOpen={isMobileSideBarOpen} toggleMobileSideBar={toggleMobileSideBar} links={links} />
        {isMobile && (
          <MobileSideBar
            isMobileSideBarOpen={isMobileSideBarOpen}
            toggleMobileSideBar={toggleMobileSideBar}
            links={links}
          />
        )}
        <div className='h-full w-full overflow-y-scroll' onClick={toggleMobileSideBarOutsideSideBar}>
          {children}
        </div>
        <ToastContainer
          position='bottom-right'
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          limit={5}
          draggable
          pauseOnHover
        />
      </div>
    </CurrentNetworkProvider>
  );
}
