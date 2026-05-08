'use client';

import { Moon, Sun } from 'lucide-react';
import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ThemeToggleButtonProps {
  theme?: 'light' | 'dark';
  className?: string;
  onClick?: () => void;
}

export const ThemeToggleButton = ({
  theme = 'light',
  className,
  onClick,
}: ThemeToggleButtonProps) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className={cn('relative cursor-pointer', className)}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
    >
      {theme === 'light' ? (
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      ) : (
        <Moon className="h-[1.2rem] w-[1.2rem]" />
      )}
    </Button>
  );
};

export const useThemeTransition = () => {
  const startTransition = useCallback((updateFn: () => void) => {
    if (!('startViewTransition' in document)) {
      updateFn();
      return;
    }
    (document as any).startViewTransition(updateFn);
  }, []);

  return { startTransition };
};
