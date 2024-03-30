import * as React from 'react';

import clsxm from '@/lib/clsxm';

import Loading from '@/components/icons/Loading';

import { useCurrentNetworkContext } from '@/contexts/CurrentNetwork';

enum ButtonVariant {
  'primary',
  'outline',
  'ghost',
  'light',
  'dark',
}

type ButtonProps = {
  isLoading?: boolean;
  isDarkBg?: boolean;
  variant?: keyof typeof ButtonVariant;
  onClick?: any;
} & React.ComponentPropsWithRef<'button'>;

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      disabled: buttonDisabled,
      isLoading,
      onClick,
      variant = 'primary',
      isDarkBg = false,
      ...rest
    },
    ref
  ) => {
    const disabled = isLoading || buttonDisabled;
    const { colorAccent } = useCurrentNetworkContext();

    return (
      <button
        ref={ref}
        type='button'
        disabled={disabled}
        onClick={onClick}
        className={clsxm(
          'box-border border-2 border-transparent',
          'inline-flex items-center rounded px-4 py-2 font-medium',
          'focus:outline-none focus-visible:ring focus-visible:ring-primary-500',
          'shadow-sm',
          'transition-colors duration-75',
          //#region  //*=========== Variants ===========
          [
            variant === 'primary' && [
              `bg-${colorAccent} text-black`,
              `hover:bg-${colorAccent}/80`,
              `active:bg-${colorAccent}/60`,
              'disabled:bg-moonbeam-grey-light ',
            ],
            variant === 'outline' && [`border-${colorAccent} bg-moonbeam-grey-dark text-${colorAccent}`],
            variant === 'ghost' && [
              'text-primary-500',
              'shadow-none',
              'hover:bg-primary-50 active:bg-primary-100 disabled:bg-primary-100',
              isDarkBg && 'hover:bg-gray-900 active:bg-gray-800 disabled:bg-gray-800',
            ],
            variant === 'light' && [
              'bg-white text-dark ',
              'border border-gray-300',
              'hover:bg-gray-100 hover:text-dark',
              'active:bg-white/80 disabled:bg-gray-200',
            ],
            variant === 'dark' && [
              'bg-gray-900 text-white',
              'border border-gray-600',
              'hover:bg-gray-800 active:bg-gray-700 disabled:bg-gray-700',
            ],
          ],
          //#endregion  //*======== Variants ===========
          'disabled:cursor-default',
          isLoading && 'relative text-transparent transition-none hover:text-transparent disabled:cursor-wait',
          className
        )}
        {...rest}
      >
        {isLoading && <Loading />}
        {children}
      </button>
    );
  }
);

export default Button;
