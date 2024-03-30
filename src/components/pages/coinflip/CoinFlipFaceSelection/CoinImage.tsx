import { MoonbaseAlpha, Moonriver } from '@usedapp/core';
import Image from 'next/image';
import React from 'react';

import useIsMobile from '@/hooks/useIsMobile';

import { useCurrentNetworkContext } from '@/contexts/CurrentNetwork';

import coinHeads from '../../../../../public/images/coin-heads.png';
import coinHeadsMoonbaseAlpha from '../../../../../public/images/coin-heads-moonbase-alpha.png';
import coinHeadsMoonriver from '../../../../../public/images/coin-heads-moonriver.png';
import coinShimmer from '../../../../../public/images/coin-shimmer.gif';
import coinTails from '../../../../../public/images/coin-tails.png';
import coinTailsMoonbaseAlpha from '../../../../../public/images/coin-tails-moonbase-alpha.png';
import coinTailsMoonriver from '../../../../../public/images/coin-tails-moonriver.png';

import { CoinFace } from '@/types';

interface CoinImagePropsStyle {
  coinFace: CoinFace;
  height?: number;
  width?: number;
  shimmer?: boolean;
}

const CoinImage = (props: CoinImagePropsStyle) => {
  const isMobile = useIsMobile();
  const { coinFace, height, width, shimmer } = props;
  const { currentNetwork } = useCurrentNetworkContext();
  const defaultImageSize = isMobile ? '80px' : '150px';
  const imageWidth = height || defaultImageSize;
  const imageHeight = width || defaultImageSize;
  const coinFaceText = coinFace === CoinFace.HEADS ? 'Heads' : 'Tails';

  return (
    <div className={`h-[${imageHeight}] w-[${imageWidth}] relative flex items-center justify-center`}>
      {shimmer && (
        <div className={`h-[${imageHeight}] w-[${imageWidth}] absolute z-10 opacity-90 mix-blend-soft-light	`}>
          <Image
            className='absolute'
            src={coinShimmer}
            layout='fixed'
            height={`${imageHeight}px`}
            width={`${imageWidth}px`}
            alt={coinFaceText}
          />
        </div>
      )}
      <div className={`h-[${imageHeight}] w-[${imageWidth}] relative flex items-center justify-center`}>
        <Image
          src={getCoinFaceImage(coinFace, currentNetwork.network.chainId)}
          layout='fixed'
          height={`${imageHeight}px`}
          width={`${imageWidth}px`}
          alt={coinFaceText}
        />
      </div>
    </div>
  );
};

function getCoinFaceImage(coinFace: CoinFace, chaindId?: number) {
  if (coinFace === CoinFace.HEADS) {
    return getHeadsCoinFaceImage(chaindId);
  }
  return getTailsCoinFaceImage(chaindId);
}

function getHeadsCoinFaceImage(chaindId?: number) {
  if (chaindId === MoonbaseAlpha.chainId) {
    return coinHeadsMoonbaseAlpha;
  }
  if (chaindId === Moonriver.chainId) {
    return coinHeadsMoonriver;
  }
  return coinHeads;
}

function getTailsCoinFaceImage(chaindId?: number) {
  if (chaindId === MoonbaseAlpha.chainId) {
    return coinTailsMoonbaseAlpha;
  }
  if (chaindId === Moonriver.chainId) {
    return coinTailsMoonriver;
  }
  return coinTails;
}

export default CoinImage;
