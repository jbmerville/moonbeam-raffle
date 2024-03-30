import React, { useEffect, useState } from 'react';
import ConfettiExplosion from 'react-confetti-explosion';

import { wait } from '@/lib/helpers';

import UnderlineLink from '@/components/links/UnderlineLink';
import CoinImage from '@/components/pages/coinflip/CoinFlipFaceSelection/CoinImage';
import PopUp from '@/components/PopUp';

import { useCoinFlipContext } from '@/contexts/CoinFlipContext';
import { useCurrentNetworkContext } from '@/contexts/CurrentNetwork';

const CoinFlipTransactionResult = () => {
  const [isPopUpOpen, setIsPopUpOpen] = useState(false);

  const { lastCoinFlipResult } = useCoinFlipContext();
  const { currentNetwork } = useCurrentNetworkContext();
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setIsPopUpOpen(true);
  }, [lastCoinFlipResult?.transactionHash]);

  useEffect(() => {
    const showConfettiDelay = async () => {
      await setShowConfetti(true);
      await wait(1000);
      setShowConfetti(false);
    };
    if (lastCoinFlipResult && lastCoinFlipResult.draw == lastCoinFlipResult.playerChoice) {
      showConfettiDelay();
    }
  }, [lastCoinFlipResult]);

  if (!lastCoinFlipResult) {
    return <></>;
  }

  const isWin = lastCoinFlipResult.draw === lastCoinFlipResult.playerChoice;

  return (
    <PopUp isVisible={isPopUpOpen} setIsVisible={setIsPopUpOpen} shake={!isWin}>
      <div className='m-3 flex flex-col items-center justify-center md:m-5 '>
        {showConfetti && (
          <div className='absolute top-32'>
            <ConfettiExplosion
              {...{
                force: 0.6,
                duration: 2500,
                particleCount: 80,
                width: 1000,
              }}
            />
          </div>
        )}
        <div className={`flex w-full justify-center text-xl md:text-3xl ${isWin ? 'text-green-400' : 'text-red-500'}`}>
          {isWin ? 'You Doubled' : 'You Got Rugged'}
        </div>
        <div className='mt-8 flex items-center justify-around md:w-[400px]'>
          <div className='flex flex-col items-center justify-center'>
            <CoinImage coinFace={lastCoinFlipResult.playerChoice} />
            <div className='mt-4'>Your Choice</div>
          </div>
          <div className='flex flex-col items-center justify-center pl-12 md:pl-0'>
            <CoinImage coinFace={lastCoinFlipResult.draw} />
            <div className='mt-4'>Flip Result</div>
          </div>
        </div>
        <UnderlineLink
          href={currentNetwork.network.getExplorerTransactionLink(lastCoinFlipResult.transactionHash)}
          className='pt-8 text-xs text-white/50'
        >
          View Transaction In Explorer
        </UnderlineLink>
      </div>
    </PopUp>
  );
};

export default CoinFlipTransactionResult;
