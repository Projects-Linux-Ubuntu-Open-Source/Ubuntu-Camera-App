import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'accent' | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  dot = false,
}) => {
  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 font-medium tracking-tight',
    md: 'text-xs px-2.5 py-1 font-medium',
  };

  const variantStyles = {
    default: 'bg-neutral-800 text-neutral-300 border border-neutral-700/60',
    success: 'bg-emerald-950/60 text-emerald-300 border border-emerald-700/50',
    warning: 'bg-amber-950/60 text-amber-300 border border-amber-700/50',
    danger: 'bg-red-950/60 text-red-300 border border-red-700/50',
    accent: 'bg-orange-950/60 text-orange-300 border border-orange-700/50',
    neutral: 'bg-[#151921] text-neutral-400 border border-neutral-800',
  };

  const dotColors = {
    default: 'bg-neutral-400',
    success: 'bg-emerald-400 animate-pulse',
    warning: 'bg-amber-400',
    danger: 'bg-red-400 animate-pulse',
    accent: 'bg-[#e95420]',
    neutral: 'bg-neutral-500',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />}
      {children}
    </span>
  );
};
