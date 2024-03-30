import React from 'react';

import CoinImage from '@/components/pages/coinflip/CoinFlipFaceSelection/CoinImage';

import { CoinFace } from '@/types';

interface CoinPropsType {
  coinFace: CoinFace;
  setPlayerCoinFaceChoice: (playerCoinFaceChoice: CoinFace) => void;
  playerCoinFaceChoice: CoinFace;
}

// Animation taken from CodePen: https://codepen.io/bill0x2A/pen/LYbqZJj
const Coin = (props: CoinPropsType) => {
  const { coinFace, playerCoinFaceChoice, setPlayerCoinFaceChoice } = props;
  const isCoinFaceSelectedByPlayer = coinFace === playerCoinFaceChoice;

  return (
    <div className='relative mx-8 flex h-[100px] flex-col items-center justify-center md:mx-20 md:mb-10 md:h-[200px]'>
      <div className='flex h-[150px] w-[100px] flex-col items-center justify-center md:h-[350px] md:w-[150px]'>
        <div className='flex h-[100px] w-[100px] flex-col items-center justify-center md:h-[200px] md:w-[150px]'>
          <div
            onClick={() => setPlayerCoinFaceChoice(coinFace)}
            className={`${
              isCoinFaceSelectedByPlayer ? 'animated-coin' : 'mb-[-40px] md:mb-[-80px]'
            } relative flex  cursor-pointer flex-col items-center justify-center rounded-full transition-all duration-150 ease-out `}
          >
            <div className='relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[100%]'>
              <CoinImage coinFace={coinFace} shimmer={isCoinFaceSelectedByPlayer} />
            </div>
            {isCoinFaceSelectedByPlayer && (
              <div className='animated-coin-flash absolute right-[10px] top-[20px] h-[5px] w-[5px] bg-white md:h-[10px] md:w-[10px]' />
            )}
          </div>
        </div>
        <div
          className={`${
            isCoinFaceSelectedByPlayer ? 'animated-coin-shadow w-[55px] md:w-[130px]' : 'mt-2 w-[70px] md:w-[150px]'
          } h-[10px]  rounded-[100%] bg-white/5 md:h-[25px]  `}
        ></div>
      </div>
    </div>
  );
};

export default Coin;
