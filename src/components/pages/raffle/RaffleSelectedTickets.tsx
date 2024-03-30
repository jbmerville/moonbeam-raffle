import { utils } from 'ethers';
import React, { ReactNode } from 'react';

import { getNetworkLogo } from '@/lib/helpers';
import useIsMobile from '@/hooks/useIsMobile';

import Button from '@/components/buttons/Button';
import RaffleTicket from '@/components/pages/raffle/RaffleTicket';
import { getMaxRaffleTicketPerTransaction, getNonDefaultRaffleSelectedTickets } from '@/components/pages/raffle/utils';
import TransactionWarningMessage from '@/components/TransactionWarningMessage';

import { useCurrentNetworkContext } from '@/contexts/CurrentNetwork';
import { useRaffleContext } from '@/contexts/RaffleContext';

import { RaffleTicketType } from '@/types';

interface RaffleSelectedTicketsPropsType {
  selectedRaffleTickets: RaffleTicketType[];
  toggleSelectedRaffleTickets: (ticket: RaffleTicketType) => void;
  resetRaffleSelectedTickets: () => void;
}

const RaffleSelectedTickets = (props: RaffleSelectedTicketsPropsType) => {
  const { raffleState, purchase, isTransactionPending, transactionStatus } = useRaffleContext();
  const isMobile = useIsMobile();
  const maxRaffleTicketPerTx = getMaxRaffleTicketPerTransaction(isMobile);
  const nonDefaultRaffleSelectedTickets = getNonDefaultRaffleSelectedTickets(props.selectedRaffleTickets);
  const { currentNetwork, colorAccent, colorAccentText } = useCurrentNetworkContext();

  const renderSelectedRaffleTicket = (ticket: RaffleTicketType, index: number): ReactNode => {
    // Render black shade ticket instead of the one selected by the player.
    if (!ticket.isSelected) {
      return (
        <div key={index} className='mx-[0px] mb-[-40px] mt-[-90px] md:mx-[0px] md:mb-[-110px] md:mt-[-215px] '>
          <RaffleTicket
            ticket={ticket}
            removeHead
            toggleSelectedRaffleTickets={props.toggleSelectedRaffleTickets}
            displayShimmer={true}
          />
        </div>
      );
    }

    // Render the ticket the player selected
    return (
      <div
        key={index}
        className=' mx-[0px] mb-[-40px] mt-[-90px] duration-150 ease-in-out hover:drop-shadow-[0_9px_9px_rgba(255,255,255,0.05)] md:mx-[0px] md:mb-[-110px] md:mt-[-240px] hover:md:mb-[-100px] hover:md:scale-[1.05]'
      >
        <RaffleTicket ticket={ticket} removeHead toggleSelectedRaffleTickets={props.toggleSelectedRaffleTickets} />
      </div>
    );
  };

  const onPurchasePressed = (): void => {
    purchase(props.selectedRaffleTickets, props.resetRaffleSelectedTickets);
  };

  return (
    <div className='layout mx-10 flex items-center justify-between md:mx-4'>
      <div className='flex w-full flex-col items-start justify-start '>
        <div className='flex w-full items-center '>
          <p className={`text-${colorAccent} text-center text-lg font-bold md:text-3xl`}>Selected Tickets</p>
        </div>
        <p className={`text-ms text-${colorAccent} text-center opacity-80 md:text-lg`}>
          Select up to {maxRaffleTicketPerTx} tickets per transaction.
        </p>
        <div className='flex w-full flex-col items-center justify-start  p-2 md:py-2 '>
          <div className='flex w-full items-center justify-between overflow-hidden overflow-x-scroll py-6 md:h-[255px] md:py-12	'>
            {props.selectedRaffleTickets.map(renderSelectedRaffleTicket)}
          </div>
          <Button
            isLoading={isTransactionPending}
            className={`relative mt-8 inline-flex w-full items-center justify-center overflow-hidden rounded-md p-0.5 text-sm font-medium text-${colorAccentText} md:text-lg `}
            onClick={onPurchasePressed}
          >
            {isTransactionPending ? (
              <span className='py-2.5 pl-2 font-extrabold uppercase text-white'>
                {transactionStatus === 'PendingSignature' ? 'Pending Signature' : transactionStatus}...
              </span>
            ) : (
              <span className='relative flex w-full items-center justify-center py-2.5 font-extrabold uppercase md:px-5'>
                <div className='scale-[1.5] pr-2'>{getNetworkLogo(currentNetwork.network.chainId)}</div>

                {nonDefaultRaffleSelectedTickets.length === 0 ? (
                  <p>
                    Ticket price: {utils.formatEther(raffleState.ticketPrice)} {currentNetwork.currencySymbol}
                  </p>
                ) : (
                  <p>
                    Buy {nonDefaultRaffleSelectedTickets.length} Ticket
                    {nonDefaultRaffleSelectedTickets.length === 1 ? '' : 's'} for{' '}
                    {utils.formatEther(raffleState.ticketPrice.mul(nonDefaultRaffleSelectedTickets.length))}{' '}
                  </p>
                )}
              </span>
            )}
          </Button>
          <TransactionWarningMessage className='mt-3' transactionStatus={transactionStatus} />
        </div>
      </div>
    </div>
  );
};

export default RaffleSelectedTickets;
