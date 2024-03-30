import React, { ReactNode, useState } from 'react';

import InfoCard, { InfoCardPropsType } from '@/components/InfoCards/InfoCard';
import PopUpBulletPoint from '@/components/InfoCards/PopUpBulletPoint';
import UnderlineLink from '@/components/links/UnderlineLink';
import PopUp from '@/components/PopUp';

import { useCurrentNetworkContext } from '@/contexts/CurrentNetwork';

interface InfoCardsPropsType {
  gameName: string;
  description: string;
  smartContractAddress: string;
  infoCard1: InfoCardPropsType;
  infoCard2: InfoCardPropsType;
  infoCard3: InfoCardPropsType;
  popUpBulletPoints: ReactNode[];
}

const InfoCards = (props: InfoCardsPropsType) => {
  const { infoCard1, infoCard2, infoCard3, popUpBulletPoints, gameName, description, smartContractAddress } = props;
  const [isReadRulesPopUpOpen, setIsReadRulesPopUpOpen] = useState(false);
  const { currentNetwork, colorAccent } = useCurrentNetworkContext();

  const onReadRulesClick = () => {
    setIsReadRulesPopUpOpen((isReadRulesPopUpOpen) => !isReadRulesPopUpOpen);
  };

  return (
    <>
      <div className='flex min-w-full grow flex-row justify-between'>
        <div className='layout flex flex-col items-center justify-between'>
          <div className='mb-1 flex w-full flex-col items-start justify-start '>
            <p className={`text-${colorAccent} text-3xl font-bold md:text-5xl`}>{gameName}</p>
            <p className={`text-${colorAccent} text-sm font-light opacity-80 md:text-lg`}>{description}</p>
          </div>
          <div className='grid w-full grid-rows-2 items-center gap-3 pt-1 md:grid-cols-3 md:grid-rows-1 md:gap-5 md:pt-5'>
            <InfoCard {...infoCard1} />
            <InfoCard {...infoCard2} className='md:hidden' />
            <InfoCard {...infoCard3} className='col-span-2 md:col-span-1' onClick={onReadRulesClick} />
            <InfoCard {...infoCard2} className='hidden md:flex' />
          </div>
        </div>
      </div>
      <PopUp isVisible={isReadRulesPopUpOpen} setIsVisible={setIsReadRulesPopUpOpen}>
        <div className='text-white md:w-[500px] md:p-5'>
          <div
            className={`text-${colorAccent} mb-6 flex items-center justify-center text-xl underline underline-offset-4 md:text-3xl`}
          >
            {gameName} Rules
          </div>
          <ul className='mt-4 list-inside list-disc space-y-1 text-sm text-gray-300 md:text-base'>
            {popUpBulletPoints.map((popUpBulletPoint, index) => (
              <PopUpBulletPoint key={index}>{popUpBulletPoint}</PopUpBulletPoint>
            ))}
          </ul>
          <p className='mt-8 text-center text-xs text-white/50'>
            View {gameName} Smart Contract in explorer:{' '}
            <UnderlineLink href={currentNetwork.network.getExplorerAddressLink(smartContractAddress)}>
              {smartContractAddress}
            </UnderlineLink>
          </p>
        </div>
      </PopUp>
    </>
  );
};

export default InfoCards;
