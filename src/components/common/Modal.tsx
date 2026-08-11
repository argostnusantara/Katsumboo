// src/components/common/Modal.tsx
import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl relative text-left border border-neutral-100 max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 font-bold text-sm"
        >
          ✕
        </button>
        <h3 className="text-xl font-black text-neutral-900 mb-4 uppercase tracking-tight">{title}</h3>
        {children}
      </div>
    </div>
  );
};