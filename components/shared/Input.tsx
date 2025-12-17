
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

const Input: React.FC<InputProps> = ({ className = '', ...props }) => {
  return (
    <input
      className={`w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent ${className}`}
      {...props}
    />
  );
};

export default Input;
