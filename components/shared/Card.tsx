
import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`bg-slate-800 border border-slate-700 rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-brand-primary/30 hover:border-brand-primary/50 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
