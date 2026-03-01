'use client';

import { Moon, Sun } from 'lucide-react';
import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type AnimationVariant =
  | 'circle'
  | 'circle-blur'
  | 'gif'
  | 'polygon';

type StartPosition =
  | 'center'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

export interface ThemeToggleButtonProps {
  theme?: 'light' | 'dark';
  showLabel?: boolean;
  variant?: AnimationVariant;
  start?: StartPosition;
  url?: string; // For gif variant
  className?: string;
  onClick?: () => void;
}

export const ThemeToggleButton = ({
  theme = 'light',
  showLabel = false,
  variant = 'circle',
  start = 'center',
  url,
  className,
  onClick,
}: ThemeToggleButtonProps) => {

  const handleClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    // Call the onClick handler if provided without the complex view-transition circles
    onClick?.();
  }, [onClick, variant, start, url, theme]);

  return (
    <Button
      variant="ghost"
      size={showLabel ? 'default' : 'icon'}
      onClick={(e) => {
        // Prevent default button behavior
        e.preventDefault();
        handleClick(e);
      }}
      className={cn(
        'relative overflow-hidden transition-all',
        showLabel && 'gap-2',
        className
      )}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
    >
      {theme === 'light' ? (
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      ) : (
        <Moon className="h-[1.2rem] w-[1.2rem]" />
      )}
      {showLabel && (
        <span className="text-sm">
          {theme === 'light' ? 'Light' : 'Dark'}
        </span>
      )}
    </Button>
  );
};

// Export a helper hook for using with View Transitions API
export const useThemeTransition = () => {
  const startTransition = useCallback((updateFn: () => void) => {
    if ('startViewTransition' in document) {
      (document as any).startViewTransition(updateFn);
    } else {
      updateFn();
    }
  }, []);

  return { startTransition };
};