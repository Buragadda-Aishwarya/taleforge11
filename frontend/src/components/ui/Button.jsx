import React from 'react';
import { cn } from '../../lib/utils';

export const Button = React.forwardRef(
  ({ variant = 'primary', className, icon, children, ...props }, ref) => {
    const baseStyles = "rounded-lg font-label-md text-sm cursor-pointer flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all tracking-wider font-medium disabled:opacity-50 disabled:pointer-events-none";
    
    const variants = {
      primary: "bg-gradient-to-r from-primary-container to-tertiary-container text-white py-3.5 px-6",
      secondary: "bg-surface-container-high border border-secondary-fixed/30 text-secondary-fixed hover:bg-secondary-fixed/5 py-3.5 px-6",
      ghost: "bg-surface-container-high border border-white/10 text-on-surface hover:bg-white/5 py-3.5 px-6",
      outline: "bg-transparent border border-white/20 text-on-surface hover:border-white/40 py-2 px-4"
    };

    return (
      <button 
        ref={ref}
        className={cn(baseStyles, variants[variant], className)} 
        {...props}
      >
        {icon && <span className="shrink-0">{icon}</span>}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
