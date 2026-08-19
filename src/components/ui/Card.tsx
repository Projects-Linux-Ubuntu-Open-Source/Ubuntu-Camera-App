import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  headerBorder?: boolean;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  action,
  headerBorder = true,
  children,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`bg-[#11151a] border border-[#1e252e] rounded-xl overflow-hidden shadow-md shadow-black/40 ${className}`}
      {...props}
    >
      {(title || subtitle || action) && (
        <div
          className={`flex items-center justify-between px-4 py-3.5 ${
            headerBorder ? 'border-b border-[#1e252e]' : ''
          }`}
        >
          <div>
            {title && <h3 className="text-sm font-semibold text-neutral-100 tracking-wide">{title}</h3>}
            {subtitle && <p className="text-xs text-neutral-400 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
};
