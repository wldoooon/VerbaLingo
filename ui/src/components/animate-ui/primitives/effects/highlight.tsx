'use client';

import * as React from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  type Transition,
} from 'motion/react';
import { cn } from '@/lib/utils';

type HighlightContextType = {
  x: any;
  y: any;
  enabled: boolean;
};

const HighlightContext = React.createContext<HighlightContextType | null>(null);

export function Highlight({
  children,
  className,
  containerClassName,
  enabled = true,
  transition = { type: 'spring', stiffness: 300, damping: 30 },
  ...props
}: any) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!enabled) return;
    const rect = event.currentTarget.getBoundingClientRect();
    x.set(event.clientX - rect.left);
    y.set(event.clientY - rect.top);
  };

  return (
    <HighlightContext.Provider value={{ x, y, enabled }}>
      <div
        className={cn('relative group/highlight', containerClassName)}
        onMouseMove={handleMouseMove}
        {...props}
      >
        {children}
      </div>
    </HighlightContext.Provider>
  );
}

export function HighlightItem({
  children,
  className,
  activeClassName,
  ...props
}: any) {
  const context = React.useContext(HighlightContext);
  if (!context || !context.enabled) return <div className={className}>{children}</div>;

  const { x, y } = context;
  const opacity = useMotionValue(0);

  return (
    <div
      className={cn('relative overflow-hidden', className)}
      onMouseEnter={() => opacity.set(1)}
      onMouseLeave={() => opacity.set(0)}
      {...props}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300 group-hover/highlight:opacity-100"
        style={{
          background: 'radial-gradient(600px circle at var(--x) var(--y), rgba(249, 115, 22, 0.1), transparent 40%)',
          opacity,
          // @ts-ignore
          '--x': `${x}px`,
          // @ts-ignore
          '--y': `${y}px`,
        } as any}
      />
      {children}
    </div>
  );
}
