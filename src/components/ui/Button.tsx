import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'recording';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-150 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer';

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1.5 rounded-md gap-1.5',
    md: 'text-sm px-3.5 py-2 rounded-lg gap-2',
    lg: 'text-base px-5 py-2.5 rounded-lg gap-2.5 font-semibold',
    icon: 'p-2 rounded-lg w-9 h-9',
  };

  const variantStyles = {
    primary:
      'bg-[#e95420] hover:bg-[#d44817] text-white shadow-sm active:translate-y-px border border-orange-500/40',
    secondary:
      'bg-[#191f28] hover:bg-[#232b36] text-neutral-200 border border-neutral-700/60 active:translate-y-px shadow-sm',
    danger:
      'bg-red-600/90 hover:bg-red-600 text-white border border-red-500/50 active:translate-y-px shadow-sm',
    ghost:
      'bg-transparent hover:bg-neutral-800/60 text-neutral-300 hover:text-white active:bg-neutral-800',
    recording:
      'bg-red-600 hover:bg-red-700 text-white animate-pulse border border-red-400 shadow-md shadow-red-900/30',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        leftIcon
      )}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
};
