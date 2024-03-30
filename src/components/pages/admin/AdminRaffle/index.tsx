import React from 'react';

import AdminBanner from '@/components/pages/admin/AdminBanner';
import EndRaffleSection from '@/components/pages/admin/AdminRaffle/EndRaffle';
import NextTicketAmount from '@/components/pages/admin/AdminRaffle/NextTicketAmount';
import NextTicketPrice from '@/components/pages/admin/AdminRaffle/NextTicketPrice';
import SetRoyaltyRaffle from '@/components/pages/admin/AdminRaffle/SetRoyaltyRaffle';

import { useCurrentNetworkContext } from '@/contexts/CurrentNetwork';
import { useRaffleContext } from '@/contexts/RaffleContext';

const AdminRaffle = () => {
  const { colorAccent, currentNetwork } = useCurrentNetworkContext();
  const { raffleState } = useRaffleContext();

  return (
    <div className={`border-${colorAccent} rounded-3xl border-2 p-4 md:mb-12 md:p-6`}>
      <AdminBanner address={currentNetwork.raffleAddress} owner={raffleState.owner} />
      <div className='mt-2 mb-14'>
        <EndRaffleSection />
      </div>
      <div className='my-14'>
        <SetRoyaltyRaffle />
      </div>
      <div className='my-14'>
        <NextTicketAmount />
      </div>
      <div className='mt-14'>
        <NextTicketPrice />
      </div>{' '}
    </div>
  );
};

export default AdminRaffle;
