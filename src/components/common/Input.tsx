// src/components/common/Input.tsx
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => {
  return (
    <div className="w-full text-left">
      <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
        {label}
      </label>
      <input
        className={`w-full px-4 py-3 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-blue-600 bg-white transition-colors placeholder-neutral-400 ${className}`}
        {...props}
      />
    </div>
  );
};