import { useReducer, useEffect, useCallback, useRef } from "react";

export interface ResponseBranch {
  id: string;
  prompt: string;
  response: string;
  timestamp: number;
}

interface ResponseHistoryState {
  branches: ResponseBranch[];
  currentIndex: number;
}

type Action =
  | { type: "LOAD_HISTORY"; payload: ResponseHistoryState }
  | { type: "ADD_BRANCH"; payload: ResponseBranch }
  | { type: "GO_PREV" }
  | { type: "GO_NEXT" }
  | { type: "GO_TO_INDEX"; payload: number }
  | { type: "CLEAR_HISTORY" };

const MAX_BRANCHES = 20;
const STORAGE_KEY = "ai_response_history";

// The "Department Head" (Reducer)
function historyReducer(
  state: ResponseHistoryState,
  action: Action
): ResponseHistoryState {
  switch (action.type) {
    case "LOAD_HISTORY":
      return action.payload;

    case "ADD_BRANCH": {
      // "Pro" Logic: Append -> Slice -> Move Index (All in one atomic step)
      const newBranches = [...state.branches, action.payload];

      // Maintain Max Size
      if (newBranches.length > MAX_BRANCHES) {
        newBranches.shift(); // Remove oldest
      }

      return {
        branches: newBranches,
        currentIndex: newBranches.length - 1, // Always jump to new tip
      };
    }

    case "GO_PREV":
      return {
        ...state,
        currentIndex: Math.max(0, state.currentIndex - 1),
      };

    case "GO_NEXT":
      return {
        ...state,
        currentIndex: Math.min(
          state.branches.length - 1,
          state.currentIndex + 1
        ),
      };

    case "GO_TO_INDEX":
      if (action.payload >= 0 && action.payload < state.branches.length) {
        return { ...state, currentIndex: action.payload };
      }
      return state;

    case "CLEAR_HISTORY":
      return { branches: [], currentIndex: -1 };

    default:
      return state;
  }
}

export function useResponseHistory() {
  // 1. Replaced useState with useReducer
  const [state, dispatch] = useReducer(historyReducer, {
    branches: [],
    currentIndex: -1,
  });

  const lastStoredId = useRef<string>("");

  // Load from sessionStorage on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const history: ResponseHistoryState = JSON.parse(stored);
        dispatch({ type: "LOAD_HISTORY", payload: history });
      }
    } catch (error) {
      console.error("Failed to load response history:", error);
    }
  }, []);

  // Sync to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error("Failed to save response history:", error);
    }
  }, [state]);

  // Actions
  const addBranch = useCallback((prompt: string, response: string) => {
    // Prevent duplicate storage (Pro Check: logic moved here to keep reducer pure)
    if (lastStoredId.current === response) return;
    lastStoredId.current = response;

    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newBranch: ResponseBranch = {
      id,
      prompt,
      response,
      timestamp: Date.now(),
    };

    dispatch({ type: "ADD_BRANCH", payload: newBranch });
  }, []);

  const goToPrevious = useCallback(() => dispatch({ type: "GO_PREV" }), []);
  const goToNext = useCallback(() => dispatch({ type: "GO_NEXT" }), []);
  const navigateToIndex = useCallback(
    (index: number) => dispatch({ type: "GO_TO_INDEX", payload: index }),
    []
  );

  const clearHistory = useCallback(() => {
    lastStoredId.current = "";
    sessionStorage.removeItem(STORAGE_KEY);
    dispatch({ type: "CLEAR_HISTORY" });
  }, []);

  // 2. The "Context Window" Feature
  // Returns the last N branches formatted as a conversation string
  const getThreadContext = useCallback(
    (limit: number = 2) => {
      if (state.branches.length === 0) return "";

      // Get last N branches (excluding current one if we are technically adding a new one)
      const recentHistory = state.branches.slice(-limit);

      return recentHistory
        .map((b) => `User: ${b.prompt}\nAI: ${b.response}`)
        .join("\n\n");
    },
    [state.branches]
  );

  return {
    // State
    branches: state.branches,
    currentIndex: state.currentIndex,
    currentBranch:
      state.currentIndex >= 0 ? state.branches[state.currentIndex] : null,
    totalBranches: state.branches.length,

    // Navigation state
    canGoBack: state.currentIndex > 0,
    canGoForward: state.currentIndex < state.branches.length - 1,

    // Actions
    addBranch,
    goToPrevious,
    goToNext,
    navigateToIndex,
    clearHistory,
    getThreadContext, // Exported for use in ai-completion
  };
}
