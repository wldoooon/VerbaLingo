import axios from "axios"
import { useUsageStore } from "@/stores/usage-store"
import { toastManager } from "@/components/ui/toast"

export const apiClient = axios.create({
  baseURL: "/api/v1",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
})

// Debounce 429 toasts so we don't spam the user
let last429Toast = 0

// Add a response interceptor to catch RateLimit headers
apiClient.interceptors.response.use(
  (response) => {
    // Debug: log all response headers to see what arrives
    console.log(`[RATE-LIMIT] ${response.config.url} status=${response.status}`, {
      "ratelimit-limit": response.headers["ratelimit-limit"],
      "ratelimit-remaining": response.headers["ratelimit-remaining"],
      "ratelimit-policy": response.headers["ratelimit-policy"],
      "all-headers": Object.fromEntries(
        Object.entries(response.headers).filter(([k]) => k.startsWith("ratelimit"))
      ),
    })

    const limit = response.headers["ratelimit-limit"]
    const remaining = response.headers["ratelimit-remaining"]
    const policy = response.headers["ratelimit-policy"]

    if (limit && remaining && policy) {
      // policy format is "feature;q=limit"
      const feature = policy.split(";")[0]
      if (feature) {
        useUsageStore.getState().updateUsage(feature, {
          limit: parseInt(limit, 10),
          remaining: parseInt(remaining, 10),
          current: parseInt(limit, 10) - parseInt(remaining, 10),
        })
      }
    }
    return response
  },
  (error) => {
    // Also catch headers from 429 errors
    if (error.response) {
      console.warn(`[RATE-LIMIT] ERROR ${error.response.config?.url} status=${error.response.status}`, {
        "ratelimit-limit": error.response.headers["ratelimit-limit"],
        "ratelimit-remaining": error.response.headers["ratelimit-remaining"],
        "ratelimit-policy": error.response.headers["ratelimit-policy"],
        "detail": error.response.data?.detail,
      })

      const limit = error.response.headers["ratelimit-limit"]
      const remaining = error.response.headers["ratelimit-remaining"]
      const policy = error.response.headers["ratelimit-policy"]

      if (limit && remaining && policy) {
        const feature = policy.split(";")[0]
        if (feature) {
          useUsageStore.getState().updateUsage(feature, {
            limit: parseInt(limit, 10),
            remaining: parseInt(remaining, 10),
            current: parseInt(limit, 10) - parseInt(remaining, 10),
          })
        }
      }

      // Show toast on 429 (rate limited) — debounced to avoid spam
      if (error.response.status === 429) {
        const now = Date.now()
        if (now - last429Toast > 5000) {
          last429Toast = now
          const detail = error.response.data?.detail || "Too many requests"
          toastManager.add({
            title: "Slow down!",
            description: detail,
            type: "warning",
          })
        }
      }
    }
    return Promise.reject(error)
  }
)