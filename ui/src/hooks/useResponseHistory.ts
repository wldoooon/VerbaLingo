import { useReducer, useEffect, useCallback, useRef } from "react";
import type { ChatSession } from "@/lib/db";

import { nanoid } from "nanoid";

export interface ResponseBranch {
  id: string;
  prompt: string;
  response: string;
  timestamp: number;
}

interface ResponseHistoryState {
  sessions: Record<string, ChatSession>; // In-Memory Cache for UI
  activeSessionId: string;
  isLoading: boolean;
}

type Action =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "LOAD_SESSIONS"; payload: ChatSession[] }
  | { type: "SWITCH_SESSION"; payload: string }
  | { type: "UPDATE_SESSION"; payload: ChatSession }
  | { type: "REMOVE_SESSION"; payload: string }
  | { type: "CLEAR_ALL" };

// Reducer handles IN-MEMORY state for fast UI
function historyReducer(
  state: ResponseHistoryState,
  action: Action
): ResponseHistoryState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    case "LOAD_SESSIONS": {
      const sessionsMap: Record<string, ChatSession> = {};
      action.payload.forEach((s) => (sessionsMap[s.id] = s));
      return { ...state, sessions: sessionsMap, isLoading: false };
    }

    case "SWITCH_SESSION":
      return { ...state, activeSessionId: action.payload };

    case "UPDATE_SESSION":
      return {
        ...state,
        sessions: {
          ...state.sessions,
          [action.payload.id]: action.payload,
        },
      };

    case "REMOVE_SESSION": {
      const nextSessions = { ...state.sessions };
      delete nextSessions[action.payload];
      return { ...state, sessions: nextSessions };
    }

    case "CLEAR_ALL":
      return { ...state, sessions: {} };

    default:
      return state;
  }
}

export function useResponseHistory() {
  const [state, dispatch] = useReducer(historyReducer, {
    sessions: {},
    activeSessionId: "default",
    isLoading: true,
  });

  // --- 1. INITIALIZATION & CLEANUP ---
  useEffect(() => {
    let mounted = true;

    async function initDB() {
      try {
        // Dynamic Import (Client-Side Only)
        const { db } = await import("@/lib/db");
        if (!db) return;

        // A. CLEANUP (The "Eboueur") - Time To Live (TTL) Strategy
        const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;
        const cutoffDate = Date.now() - THREE_DAYS_MS;

        // Delete old sessions
        await db.sessions.where("lastActive").below(cutoffDate).delete();

        // Keep only top 50 recent sessions (Optional overflow protection)
        const allKeys = await db.sessions
          .orderBy("lastActive")
          .reverse()
          .primaryKeys();
        if (allKeys.length > 50) {
          const keysToDelete = allKeys.slice(50);
          await db.sessions.bulkDelete(keysToDelete);
        }

        // B. LOAD REMAINING
        const sessions = await db.sessions.toArray();

        if (mounted) {
          dispatch({ type: "LOAD_SESSIONS", payload: sessions });
        }
      } catch (err) {
        console.error("Failed to init Dexie:", err);
      }
    }

    initDB();

    return () => {
      mounted = false;
    };
  }, []);

  // --- 2. ACTIONS ---

  // Switch: Updates State + Updates DB 'lastActive'
  const switchSession = useCallback((sessionId: string) => {
    if (!sessionId) return;

    // Optimistic UI Update
    dispatch({ type: "SWITCH_SESSION", payload: sessionId });

    // Async Background DB Update
    (async () => {
      const { db } = await import("@/lib/db");
      if (!db) return;

      try {
        // Check if session exists in DB, if not create partial
        const existing = await db.sessions.get(sessionId);
        const sessionToSave: ChatSession = existing || {
          id: sessionId,
          branches: [],
          lastActive: Date.now(),
          createdAt: Date.now(),
        };

        // Put = Insert or Update (Update timestamp)
        await db.sessions.put({ ...sessionToSave, lastActive: Date.now() });

        // Update local state to match
        dispatch({ type: "UPDATE_SESSION", payload: sessionToSave });
      } catch (err) {
        console.error("Failed to switch session in DB:", err);
      }
    })();
  }, []);

  // Add Branch: The Main Action
  const addBranch = useCallback(
    (prompt: string, response: string) => {
      // Optimistic update logic could go here, but for safety we await DB currently
      // to ensure ID consistency. UX improvement: Add optimistic dispatch later if laggy.

      (async () => {
        const { db } = await import("@/lib/db");
        if (!db) return;

        const sessionId = state.activeSessionId; // Capture current ID
        const timestamp = Date.now();

        const newBranch: ResponseBranch = {
          id: `${timestamp}-${Math.random().toString(36).substr(2, 9)}`,
          prompt,
          response,
          timestamp,
        };

        try {
          await db.transaction("rw", db.sessions, async () => {
            const session = await db.sessions.get(sessionId);

            const currentBranches = session?.branches || [];
            const updatedBranches = [...currentBranches, newBranch];

            // Limit per session (e.g. 20 messages)
            if (updatedBranches.length > 20) updatedBranches.shift();

            const updatedSession: ChatSession = {
              id: sessionId,
              branches: updatedBranches,
              lastActive: timestamp,
              createdAt: session?.createdAt || timestamp,
            };

            await db.sessions.put(updatedSession);

            // Dispatch to UI
            dispatch({ type: "UPDATE_SESSION", payload: updatedSession });
          });
        } catch (err) {
          console.error("Failed to add branch to DB:", err);
        }
      })();
    },
    [state.activeSessionId]
  );

  // Navigation Logic (Purely Local State)
  const activeSession = state.sessions[state.activeSessionId] || {
    branches: [],
    lastActive: Date.now(),
  };
  const branches = activeSession.branches || [];

  // We strictly use the TOP branch as "Current" for now, or maintain a local index
  // Using simple reducer for local UI state that doesn't need persistence
  const [localIndex, setLocalIndex] = useReducer(
    (prev: number, action: any) => {
      if (action.type === "SET") return action.payload;
      return prev;
    },
    -1
  );

  // Sync local index when branches change (Auto-scroll to bottom on new message)
  const prevBranchesLen = useRef(branches.length);

  useEffect(() => {
    // 1. Detect New Branch Addition (Auto-jump to end)
    if (branches.length > prevBranchesLen.current) {
      setLocalIndex({ type: "SET", payload: branches.length - 1 });
      prevBranchesLen.current = branches.length;
      return;
    }
    prevBranchesLen.current = branches.length;

    // 2. Standard Sync Logic
    // If we have a persisted currentIndex, use it!
    if (
      activeSession.currentIndex !== undefined &&
      activeSession.currentIndex !== localIndex
    ) {
      setLocalIndex({ type: "SET", payload: activeSession.currentIndex });
    } else if (localIndex === -1 && branches.length > 0) {
      // Only default to end if uninitialized
      setLocalIndex({ type: "SET", payload: branches.length - 1 });
    } else if (branches.length > 0 && localIndex >= branches.length) {
      // Bound check
      setLocalIndex({ type: "SET", payload: branches.length - 1 });
    }
  }, [branches.length, state.activeSessionId, activeSession.currentIndex]); // Added activeSession.currentIndex dependency

  // Helper to persist index
  const updateDBIndex = useCallback(
    (newIndex: number) => {
      (async () => {
        const { db } = await import("@/lib/db");
        if (!db) return;
        try {
          await db.sessions.update(state.activeSessionId, {
            currentIndex: newIndex,
            lastActive: Date.now(),
          });
        } catch (e) {
          console.error("Index persist failed", e);
        }
      })();
    },
    [state.activeSessionId]
  );

  const goToPrevious = useCallback(() => {
    const newIdx = Math.max(0, localIndex - 1);
    setLocalIndex({ type: "SET", payload: newIdx });
    updateDBIndex(newIdx);
  }, [localIndex, updateDBIndex]);
  const goToNext = useCallback(() => {
    const newIdx = Math.min(branches.length - 1, localIndex + 1);
    setLocalIndex({ type: "SET", payload: newIdx });
    updateDBIndex(newIdx);
  }, [branches.length, localIndex, updateDBIndex]);
  const navigateToIndex = useCallback(
    (index: number) => {
      setLocalIndex({ type: "SET", payload: index });
      updateDBIndex(index);
    },
    [updateDBIndex]
  );

  const clearHistory = useCallback(() => {
    (async () => {
      const { db } = await import("@/lib/db");
      if (db) {
        await db.sessions.clear();
        dispatch({ type: "CLEAR_ALL" });
      }
    })();
  }, []);

  // Helper for Context
  const getThreadContext = useCallback(
    (limit: number = 2) => {
      if (!branches || branches.length === 0) return "";
      const recent = branches.slice(-limit);
      return recent
        .map((b) => `User: ${b.prompt}\nAI: ${b.response}`)
        .join("\n\n");
    },
    [branches]
  );

  // Delete a session
  const deleteSession = useCallback(
    async (sessionId: string, e?: React.MouseEvent) => {
      if (e) {
        e.stopPropagation(); // Prevent triggering selection
        e.preventDefault();
      }

      try {
        const { db } = await import("@/lib/db");
        if (db) {
          await db.sessions.delete(sessionId);
          dispatch({ type: "REMOVE_SESSION", payload: sessionId });

          // If we deleted the active session, clear current state
          if (sessionId === state.activeSessionId) {
            // We'll let the reducer handle switching to a new session or we force a window reload/reset
            // For now, let's just create a new session
            // Actually, the easiest way is to just call createNewSession if empty
            dispatch({ type: "SWITCH_SESSION", payload: nanoid() });
          }
        }
      } catch (error) {
        console.error("Failed to delete session:", error);
      }
    },
    [state.activeSessionId]
  );

  return {
    // Global State (Metadata for Selector)
    sessions: state.sessions,
    activeSessionId: state.activeSessionId,

    // Full Active Session State
    branches,
    currentIndex: localIndex,
    currentBranch: localIndex >= 0 ? branches[localIndex] : null,
    totalBranches: branches.length,

    // Navigation state
    canGoBack: localIndex > 0,
    canGoForward: localIndex < branches.length - 1,

    // Actions
    switchSession,
    addBranch,
    goToPrevious,
    goToNext,
    navigateToIndex,
    clearHistory,
    getThreadContext,
    deleteSession, // Export
  };
}
