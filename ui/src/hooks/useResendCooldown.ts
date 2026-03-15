import { useEffect, useRef, useState } from "react";

/**
 * Starts a countdown timer for resend cooldowns.
 * Call `start()` after firing a resend request.
 * `isCoolingDown` is true while the timer is running.
 */
export function useResendCooldown(seconds = 60) {
  const [remaining, setRemaining] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setRemaining(seconds);
    timerRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return { remaining, isCoolingDown: remaining > 0, start };
}
