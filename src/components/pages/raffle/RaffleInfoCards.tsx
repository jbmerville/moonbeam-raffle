import { faBook, faClock, faReceipt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { ReactNode } from 'react';
import Countdown from 'react-countdown';

import InfoCards from '@/components/InfoCards';
import { InfoCardPropsType } from '@/components/InfoCards/InfoCard';

import { useCurrentNetworkContext } from '@/contexts/CurrentNetwork';
import { useRaffleContext } from '@/contexts/RaffleContext';

const RaffleInfoCards = () => {
  const { raffleState, isRaffleStateFetching } = useRaffleContext();
  const { currentNetwork } = useCurrentNetworkContext();

  const infoCard1: InfoCardPropsType = {
    title: `${raffleState.ticketsLeft.length}/${raffleState.maxTicketAmount}`,
    subtitle: (
      <>
        <FontAwesomeIcon icon={faReceipt} size='xs' className='mr-2 w-[10px]' />
        Tickets Left
      </>
    ),
    isLoading: isRaffleStateFetching,
  };
  const infoCard2: InfoCardPropsType = {
    title: <Countdown key={raffleState.draftTime.getTime()} date={raffleState.draftTime} />,
    subtitle: (
      <>
        <FontAwesomeIcon icon={faClock} size='xs' className='mr-2 w-[14px]' />
        Ends
      </>
    ),
    isLoading: isRaffleStateFetching,
  };
  const infoCard3: InfoCardPropsType = {
    title: 'Read the Rules',
    subtitle: (
      <>
        <FontAwesomeIcon icon={faBook} size='xs' className='mr-2 w-[12px]' />
        How Does It Work?
      </>
    ),
  };
  const popUpBulletPoints: ReactNode[] = [
    <>
      Each ticket has the <span className='text-${colorAccent}'> same chance </span>
      of being selected.
    </>,
    <>
      A winner is picked when either all tickets are{' '}
      <span className='text-${colorAccent}'>sold out or the timer ends</span>. Whichever comes first.
    </>,
    <>
      The winner receives <span className='text-${colorAccent}'>{100 - raffleState.royalty}%</span> of all the{' '}
      {currentNetwork.currencySymbol} in the pool. The house keeps {raffleState.royalty}%.
    </>,
    <>
      At the end of each round, the raffle is{' '}
      <span className='text-${colorAccent}'>reset with one more ticket than the previous round</span>.
    </>,
  ];

  return (
    <InfoCards
      gameName='Raffle'
      description='Buy tickets, when tickets are sold out, one winner is picked at random and receives all the funds in the pool.'
      infoCard1={infoCard1}
      infoCard2={infoCard2}
      infoCard3={infoCard3}
      popUpBulletPoints={popUpBulletPoints}
      smartContractAddress={currentNetwork.raffleAddress}
    />
  );
};

export default RaffleInfoCards;
