import React from 'react';
import { cn } from '../../lib/utils';

export const GlassCard = React.forwardRef(
  ({ className, children, borderAccent = 'none', ...props }, ref) => {
    const accents = {
      none: '',
      primary: 'border-t-2 border-t-primary',
      secondary: 'border-l-4 border-l-secondary-fixed'
    };

    return (
      <div 
        ref={ref}
        className={cn("glass-panel rounded-xl p-6", accents[borderAccent], className)} 
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = 'GlassCard';
