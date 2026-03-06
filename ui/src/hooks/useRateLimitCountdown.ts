import { useEffect, useRef, useState } from "react";

/**
 * Parses seconds from backend rate-limit messages like:
 *   "Too many requests. Try again in 51s."
 *   "Rate limit exceeded. Retry in 30s."
 */
function parseSeconds(message: string): number | null {
  const match = message.match(/\b(\d+)\s*s\b/i);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Detects a rate-limit error and returns a live countdown message.
 *
 * - If the error message contains "Xs", it strips the raw seconds and
 *   replaces them with a live ticking countdown.
 * - Returns null when there is no rate-limit error (or countdown finished).
 *
 * Usage:
 *   const rateLimitMsg = useRateLimitCountdown(mutation.error)
 *   {rateLimitMsg && <p>{rateLimitMsg}</p>}
 */
export function useRateLimitCountdown(error: unknown): string | null {
  const [countdown, setCountdown] = useState<number | null>(null);
  // Keep a ref to the raw message prefix (everything before the seconds)
  const prefixRef = useRef<string>("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Derive a plain string from the error
  const message = deriveMessage(error);

  useEffect(() => {
    // No error or not a rate-limit → reset
    if (!message || !/try again in|retry in/i.test(message)) {
      setCountdown(null);
      return;
    }

    const secs = parseSeconds(message);
    if (!secs) {
      setCountdown(null);
      return;
    }

    // Build prefix: everything before the seconds value
    prefixRef.current = message.replace(/\b\d+\s*s\b/i, "").trim();

    setCountdown(secs);

    // Tick every second
    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(intervalRef.current!);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // Re-run only when the raw message changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message]);

  if (countdown === null) return null;

  // Reassemble: prefix + live countdown
  const prefix = prefixRef.current || "Too many requests. Try again in";
  return `${prefix} ${countdown}s`;
}

function deriveMessage(error: unknown): string | null {
  if (!error) return null;
  // axios error
  if (typeof error === "object" && error !== null && "response" in error) {
    const axiosErr = error as {
      response?: { data?: { detail?: string; message?: string } };
    };
    return (
      axiosErr.response?.data?.detail ??
      axiosErr.response?.data?.message ??
      null
    );
  }
  if (error instanceof Error) return error.message;
  return null;
}
