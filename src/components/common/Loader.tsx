// src/components/common/Loader.tsx
import React from 'react';

export const Loader: React.FC<{ message?: string }> = ({ message = 'Memuat data...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
      <div className="w-8 h-8 border-4 border-neutral-200 border-t-blue-600 rounded-full animate-spin" />
      <p className="text-xs text-neutral-400 font-medium font-sans mt-1">{message}</p>
    </div>
  );
};