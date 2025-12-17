
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({
  children,
  className = '',
  variant = 'primary',
  ...props
}) => {
  const baseClasses = 'px-6 py-2 font-semibold rounded-md shadow-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-brand-primary text-white hover:bg-brand-primary/90 focus:ring-brand-primary',
    secondary: 'bg-brand-accent text-white hover:bg-brand-accent/90 focus:ring-brand-accent',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
