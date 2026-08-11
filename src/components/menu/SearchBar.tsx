// src/components/menu/SearchBar.tsx
import React from 'react';

interface SearchBarProps {
  keyword: string;
  onKeywordChange: (text: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ keyword, onKeywordChange }) => {
  return (
    <div className="w-full mb-6 relative text-left">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 text-sm pointer-events-none">
        🔍
      </span>
      <input
        type="text"
        value={keyword}
        onChange={(e) => onKeywordChange(e.target.value)}
        placeholder="Cari chicken katsu favoritmu di sini..."
        className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-neutral-200 text-xs font-medium focus:outline-none focus:border-blue-600 transition-colors bg-white shadow-sm placeholder-neutral-400"
      />
      {keyword && (
        <button
          onClick={() => onKeywordChange('')}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400 hover:text-neutral-600"
        >
          ✕ Clear
        </button>
      )}
    </div>
  );
};