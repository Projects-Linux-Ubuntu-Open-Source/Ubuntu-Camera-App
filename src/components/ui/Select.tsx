import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  icon?: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  label,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-xs font-medium text-neutral-300">{label}</label>}
      <div className="relative flex items-center">
        {icon && <span className="absolute left-3 text-neutral-400 pointer-events-none">{icon}</span>}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`w-full bg-[#161c24] border border-[#232b36] hover:border-neutral-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 text-neutral-200 text-sm rounded-lg px-3 py-2 ${
            icon ? 'pl-9' : ''
          } pr-9 appearance-none outline-none transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled} className="bg-[#161c24] text-neutral-200">
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-3 pointer-events-none" />
      </div>
    </div>
  );
};
