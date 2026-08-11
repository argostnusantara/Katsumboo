// src/components/menu/Category.tsx
import React from 'react';

interface CategoryProps {
  categories?: string[];
  selectedCategory?: string;
  onSelectCategory: (category: string) => void;
}

export const Category: React.FC<CategoryProps> = ({ 
  categories = [], 
  selectedCategory = 'Semua', 
  onSelectCategory 
}) => {
  const safeCategories = Array.isArray(categories) ? categories : [];
  const allCategories = ['Semua', ...safeCategories];

  return (
    <div className="w-full overflow-x-auto no-scrollbar flex gap-2 pb-4 mb-6 scroll-smooth select-none">
      {(allCategories || []).map((cat, idx) => {
        const label = typeof cat === 'string' ? cat : (cat as any)?.name || String(cat || '');
        return (
          <button
            key={typeof cat === 'string' ? `${cat}-${idx}` : (cat as any)?.id || idx}
            type="button"
            onClick={() => onSelectCategory(label)}
            className={`py-2 px-5 text-xs font-bold rounded-full border transition-all shrink-0 uppercase tracking-wider ${
              selectedCategory === label
                ? 'border-blue-600 bg-blue-600 text-white shadow-md'
                : 'border-neutral-200 text-neutral-600 bg-white hover:bg-neutral-50'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
};