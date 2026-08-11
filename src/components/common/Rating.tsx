// src/components/common/Rating.tsx
import React from 'react';

export const Rating: React.FC<{ value?: number }> = ({ value = 5 }) => {
  return (
    <div className="flex items-center gap-0.5 select-none" title={`Rating ${value}/5`}>
      {Array.from({ length: 5 }).map((_, idx) => (
        <span 
          key={idx} 
          className={`text-sm ${idx < value ? 'text-amber-400' : 'text-neutral-200'}`}
        >
          ★
        </span>
      ))}
    </div>
  );
};