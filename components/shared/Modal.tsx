
import React, { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-lg relative flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-4 duration-300"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex justify-between items-center p-6 border-b border-slate-700/50">
          <h2 className="text-2xl font-bold text-white tracking-tight">{title}</h2>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white bg-slate-700/50 hover:bg-slate-700 rounded-full p-2 transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 overflow-y-auto text-slate-300 leading-relaxed custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
