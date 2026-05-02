import axios from "axios";
import { useUsageStore } from "@/stores/usage-store";
import { useAuthStore } from "@/stores/auth-store";
import { toastManager } from "@/components/ui/toast";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL ?? "",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Debounce 429 toasts so we don't spam the user
let last429Toast = 0;

// Track refresh token state to prevent infinite loops and concurrent refreshes
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Add a response interceptor to catch RateLimit headers and 401 Auth errors
apiClient.interceptors.response.use(
  (response) => {
    const limit = response.headers["ratelimit-limit"];
    const remaining = response.headers["ratelimit-remaining"];
    const policy = response.headers["ratelimit-policy"];

    if (limit && remaining && policy) {
      const feature = policy.split(";")[0];
      // Guests: update in real-time from headers (limited quota, need immediate feedback).
      // Authenticated users: correct usage comes from /auth/me → setAllUsage.
      // Skipping header updates for authenticated users prevents guest-tier limits
      // from overwriting correct values if a request slips through during a brief
      // token-expiry window (edge case, but cheap to guard).
      if (feature && useAuthStore.getState().status !== "authenticated") {
        useUsageStore.getState().updateUsage(feature, {
          limit: parseInt(limit, 10),
          remaining: parseInt(remaining, 10),
          current: parseInt(limit, 10) - parseInt(remaining, 10),
        });
      }
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response) {
      // 1. Rate Limit Tracking from Headers
      // Skip 401 responses: they carry guest-tier limits and would corrupt the
      // authenticated user's usage state, causing false rate-limit blocks.
      if (error.response.status !== 401) {
        const limit = error.response.headers["ratelimit-limit"];
        const remaining = error.response.headers["ratelimit-remaining"];
        const policy = error.response.headers["ratelimit-policy"];

        if (limit && remaining && policy) {
          const feature = policy.split(";")[0];
          if (feature) {
            useUsageStore.getState().updateUsage(feature, {
              limit: parseInt(limit, 10),
              remaining: parseInt(remaining, 10),
              current: parseInt(limit, 10) - parseInt(remaining, 10),
            });
          }
        }
      }

      // 2. 429 Too Many Requests Handling
      if (error.response.status === 429) {
        const now = Date.now();
        if (now - last429Toast > 5000) {
          last429Toast = now;
          const detail = error.response.data?.detail || "Too many requests";
          toastManager.add({
            title: "Slow down!",
            description: detail,
            type: "warning",
          });
        }
      }

      // 3. 401 UNAUTHORIZED HANDLING (Refresh Token Flow)
      if (error.response.status === 401 && !originalRequest._retry) {
        // Do not intercept if the request itself was a refresh or login to avoid loops
        if (
          originalRequest.url === "/auth/refresh" ||
          originalRequest.url === "/auth/login"
        ) {
          return Promise.reject(error);
        }

        if (isRefreshing) {
          return new Promise(function (resolve, reject) {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              return apiClient(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // Attempt the refresh!
          await apiClient.post("/auth/refresh");

          processQueue(null);
          return apiClient(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          // If the refresh fails (e.g., token expired or revoked), the user must log in again
          // The queryClient will automatically handle this if useMeQuery fails
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }
    }
    return Promise.reject(error);
  },
);
