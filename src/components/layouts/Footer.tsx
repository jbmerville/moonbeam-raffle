import React from 'react';

interface FooterPropsType {
  className?: string;
}

const Footer = (props: FooterPropsType) => {
  const { className } = props;

  return (
    <div className={`${className} ${className?.includes('bg-') ? '' : 'bg-moonbeam-grey'}`}>
      <div className='layout flex flex-col items-center justify-center border-t border-[#474d57] pt-6 pb-6 md:border-t-[0.5px]'>
        <div className='flex w-full items-center justify-center text-center  text-xs text-white/50 md:text-sm'>
          MoonVegas is not available in Excluded Jurisdictions. By accessing and using the interface you agree with our
          Terms & Conditions.
        </div>
        <div className='break-words p-1 text-center text-xs text-white/50 md:text-sm '>
          MoonVegas &copy; {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
};

export default Footer;
