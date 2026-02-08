/**
 * Google OAuth Hook
 *
 * Handles the popup-based OAuth flow for Google authentication.
 *
 * How it works:
 * 1. Opens a popup window pointing to /api/v1/auth/google/login
 * 2. Popup goes through Google authentication
 * 3. Backend callback sets auth cookie and returns HTML with postMessage
 * 4. This hook listens for the message and resolves the promise
 */

import { useCallback, useEffect, useRef } from "react";
import { useAuthStore } from "@/stores/auth-store";

const OAUTH_POPUP_WIDTH = 500;
const OAUTH_POPUP_HEIGHT = 600;

// For OAuth, we need the direct backend URL (not proxied through Next.js)
// because Google redirects directly to the backend callback
const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:5001";

interface OAuthResult {
  success: boolean;
  user?: {
    id: string;
    email: string;
    tier: string;
  };
  error?: string;
}

export function useGoogleOAuth() {
  const popupRef = useRef<Window | null>(null);
  const resolveRef = useRef<((result: OAuthResult) => void) | null>(null);
  const setUser = useAuthStore((s) => s.setUser);
  const setStatus = useAuthStore((s) => s.setStatus);

  // Listen for messages from the popup
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Security: Only accept messages from our backend
      if (event.origin !== BACKEND_URL) {
        return;
      }

      const { type, user, error } = event.data;

      if (type === "oauth-success" && user) {
        // OAuth succeeded - update auth state
        setStatus("authenticated");
        setUser(user);

        if (resolveRef.current) {
          resolveRef.current({ success: true, user });
          resolveRef.current = null;
        }
      } else if (type === "oauth-error") {
        if (resolveRef.current) {
          resolveRef.current({ success: false, error });
          resolveRef.current = null;
        }
      }

      // Close popup if still open
      if (popupRef.current && !popupRef.current.closed) {
        popupRef.current.close();
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [setUser, setStatus]);

  // Open the OAuth popup
  const openGoogleOAuth = useCallback((): Promise<OAuthResult> => {
    return new Promise((resolve) => {
      // Store resolver for when popup responds
      resolveRef.current = resolve;

      // Calculate popup position (center of screen)
      const left = window.screenX + (window.innerWidth - OAUTH_POPUP_WIDTH) / 2;
      const top =
        window.screenY + (window.innerHeight - OAUTH_POPUP_HEIGHT) / 2;

      // Open popup
      const popup = window.open(
        `${BACKEND_URL}/auth/google/login`,
        "google-oauth",
        `width=${OAUTH_POPUP_WIDTH},height=${OAUTH_POPUP_HEIGHT},left=${left},top=${top},scrollbars=yes`,
      );

      if (!popup) {
        resolve({
          success: false,
          error: "Popup blocked. Please allow popups for this site.",
        });
        return;
      }

      popupRef.current = popup;

      // Poll to check if popup was closed without completing
      const pollTimer = setInterval(() => {
        if (popup.closed) {
          clearInterval(pollTimer);
          // If we haven't received a message, user closed the popup
          if (resolveRef.current) {
            resolveRef.current({
              success: false,
              error: "Authentication cancelled",
            });
            resolveRef.current = null;
          }
        }
      }, 500);
    });
  }, []);

  return { openGoogleOAuth };
}
