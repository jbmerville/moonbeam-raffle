import { faClock, faInfoCircle, faWarning } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import Countdown from 'react-countdown';

import useIsMobile from '@/hooks/useIsMobile';

import Loading from '@/components/icons/Loading';
import InfoCard, { InfoCardPropsType } from '@/components/InfoCards/InfoCard';
import { parseTransactionStatus } from '@/components/pages/coinflip/utils';

import { useCurrentNetworkContext } from '@/contexts/CurrentNetwork';
import { useRaffleContext } from '@/contexts/RaffleContext';

const EndRaffle = () => {
  const { raffleState, isRaffleStateFetching, endRaffle, isTransactionPending, transactionStatus } = useRaffleContext();
  const isRaffleOver = raffleState.draftTime.getTime() < Date.now();
  const { colorAccent, currentNetwork, colorAccentText } = useCurrentNetworkContext();
  const isMobile = useIsMobile();
  const winnerCut = ((100 - raffleState.royalty) / 100) * raffleState.contractBalance;
  const ownerCut = (raffleState.royalty / 100) * raffleState.contractBalance;
  const hasNoTicketsBeenSold = raffleState.ticketsBought.length === 0;

  const raffleEndTimerInfCard: InfoCardPropsType = {
    title: isRaffleOver ? (
      <div>Ended</div>
    ) : (
      <Countdown key={raffleState.draftTime.getTime()} date={raffleState.draftTime} />
    ),
    subtitle: (
      <>
        <FontAwesomeIcon icon={faClock} size='xs' className='mr-1 mt-[6px] w-[14px]' />
        Ends
      </>
    ),
    isLoading: isRaffleStateFetching,
  };

  const onEndRaffleClicked = () => {
    if (!isTransactionPending && !hasNoTicketsBeenSold) {
      endRaffle();
    }
  };

  const endRaffleButtonInfoCard: InfoCardPropsType = {
    title: (
      <div className='mt-[7px] uppercase text-inherit md:text-xl'>
        {isTransactionPending ? (
          <div className='flex items-center justify-center'>
            <div className='mr-2'>
              <Loading />
            </div>
            <span className=' mt-1 font-extrabold uppercase text-white'>
              {parseTransactionStatus(transactionStatus)}...
            </span>
          </div>
        ) : (
          'End and restart Raffle'
        )}
      </div>
    ),
    subtitle: <></>,
  };

  return (
    <div className='grid w-full grid-rows-2 items-center gap-3 md:grid-cols-3 md:grid-rows-1 md:gap-5'>
      <InfoCard {...raffleEndTimerInfCard} />
      <InfoCard
        {...endRaffleButtonInfoCard}
        onClick={onEndRaffleClicked}
        className={hasNoTicketsBeenSold ? '' : `mt-1 bg-${colorAccent} text-${colorAccentText}`}
      />
      <div className='flex h-full flex-col justify-around  text-sm text-white'>
        <div>
          {isMobile ? <>&uarr;</> : <>&larr;</>} Click this button to end the{' '}
          <span className={`text-${colorAccent}`}>{currentNetwork.network.chainName}</span> raffle
        </div>
        <p className='mt-6 text-white/50 md:mt-0'>
          {hasNoTicketsBeenSold ? (
            <>
              <FontAwesomeIcon icon={faWarning} size='sm' className='mr-2 inline w-[13px] text-amber-400' />
              No tickets have been purchased. This transaction only works if at least one ticket has been purchased
            </>
          ) : (
            <>
              <FontAwesomeIcon
                icon={faInfoCircle}
                size='sm'
                className='mr-2 inline w-[13px] text-moonbase-alpha-accent'
              />
              Ending the raffle will send{' '}
              <span className='text-${colorAccent}'>
                {winnerCut.toFixed(2)} {currentNetwork.currencySymbol}
              </span>{' '}
              to a random winner,{' '}
              <span className='text-${colorAccent}'>
                {ownerCut.toFixed(2)} {currentNetwork.currencySymbol}
              </span>{' '}
              to the owner, and restarts the raffle. {raffleState.owner}
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default EndRaffle;
