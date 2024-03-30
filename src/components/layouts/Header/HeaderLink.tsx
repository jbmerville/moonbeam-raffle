import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';

import useIsMobile from '@/hooks/useIsMobile';

import { LinkType } from '@/components/layouts/Layout';

import { useCurrentNetworkContext } from '@/contexts/CurrentNetwork';

interface HeaderLinkPropsType {
  link: LinkType;
}

const HeaderLink = (props: HeaderLinkPropsType) => {
  const { link } = props;
  const { colorAccent } = useCurrentNetworkContext();
  const { asPath } = useRouter();
  const isMobile = useIsMobile();

  return (
    <Link key={link.url} href={link.url}>
      <a className={`hover:text-${colorAccent} ${asPath === link.url ? `text-${colorAccent}` : 'text-white'} ml-8`}>
        <div className='flex w-fit items-center justify-center font-bold'>
          {link.name} {link.isBeta && <div className='ml-2 rounded-md bg-amber-400 p-1 text-xs text-black'>Beta</div>}
          {isMobile && link.description && <div className='pl-2 text-xs text-white/50'> - {link.description}</div>}
        </div>
      </a>
    </Link>
  );
};

export default HeaderLink;
