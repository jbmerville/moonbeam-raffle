import React from 'react';

import CoinImage from '@/components/pages/coinflip/CoinFlipFaceSelection/CoinImage';

import { CoinFace } from '@/types';

const CoinFlipping = () => {
  return (
    <div className='relative mx-8 flex h-[100px] flex-col items-center justify-center md:mx-20 md:mb-10 md:h-[200px]'>
      <div className='flex flex-col items-center justify-center '>
        <div className='animated-coin-flip relative flex h-[80px] w-[80px] flex-col items-center justify-center rounded-full md:h-[150px] md:w-[150px]'>
          <div className='animated-coin-heads absolute flex h-[80px] w-[80px] flex-col items-center justify-center rounded-full backface-hidden md:h-[150px] md:w-[150px]'>
            <CoinImage coinFace={CoinFace.HEADS} shimmer />
          </div>
          <div className='animated-coin-tails absolute flex h-[80px] w-[80px] flex-col items-center justify-center rounded-full backface-hidden md:h-[150px] md:w-[150px]'>
            <CoinImage coinFace={CoinFace.TAILS} shimmer />
          </div>
        </div>
        <div className='animated-coin-shadow mt-3 h-[10px] w-[60px] rounded-[100%] bg-white/5 md:mt-10 md:h-[25px] md:w-[120px]'></div>
      </div>
    </div>
  );
};

export default CoinFlipping;
