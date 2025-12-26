"use client";

import * as React from "react";

export interface useCopyToClipboardProps {
  timeout?: number;
  onCopy?: () => void;
}

export function useCopyToClipboard({
  timeout = 2000,
  onCopy,
}: useCopyToClipboardProps = {}) {
  const [isCopied, setIsCopied] = React.useState(false);

  const copyToClipboard = (value: string) => {
    if (typeof window === "undefined" || !value) {
      return;
    }

    navigator.clipboard.writeText(value).then(() => {
      setIsCopied(true);

      if (onCopy) {
        onCopy();
      }

      setTimeout(() => {
        setIsCopied(false);
      }, timeout);
    });
  };

  return { isCopied, copyToClipboard };
}
