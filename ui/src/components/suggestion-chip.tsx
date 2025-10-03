"use client";

import { ReactNode } from "react";

interface SuggestionChipProps {
  icon: ReactNode;
  text: string;
  onClick?: () => void;
}

export const SuggestionChip = ({ icon, text, onClick }: SuggestionChipProps) => {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 px-4 py-2 bg-card border rounded-full text-sm text-card-foreground hover:bg-accent hover:text-accent-foreground hover:border-accent transition-all duration-200 shadow-sm hover:shadow-md"
    >
      {icon}
      <span className="font-medium">{text}</span>
    </button>
  );
};
