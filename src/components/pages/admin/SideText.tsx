import { faInfoCircle, faWarning } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { ReactNode } from 'react';

import useIsMobile from '@/hooks/useIsMobile';

interface SideTextPropsType {
  topMessage: ReactNode;
  bottomMessage: {
    level: 'WARN' | 'INFO';
    message: ReactNode;
  };
}
const SideText = (props: SideTextPropsType) => {
  const { topMessage, bottomMessage } = props;
  const isMobile = useIsMobile();

  return (
    <div className='mt-3 flex h-full flex-col justify-around  text-sm text-white md:mt-0'>
      <div>
        {isMobile ? <>&uarr;</> : <>&larr;</>} {topMessage}
      </div>
      <p className='mt-6 text-white/50 md:mt-0'>
        <FontAwesomeIcon
          icon={bottomMessage.level === 'INFO' ? faInfoCircle : faWarning}
          size='sm'
          className='mr-2 inline w-[13px] text-moonbase-alpha-accent'
        />
        {bottomMessage.message}
      </p>
    </div>
  );
};

export default SideText;
