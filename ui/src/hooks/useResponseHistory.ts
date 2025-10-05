import { useState, useEffect, useCallback, useRef } from 'react';

export interface ResponseBranch {
    id: string;
    prompt: string;
    response: string;
    timestamp: number;
}

interface ResponseHistory {
    branches: ResponseBranch[];
    currentIndex: number;
}

const MAX_BRANCHES = 20;
const STORAGE_KEY = 'ai_response_history';

export function useResponseHistory() {
    const [branches, setBranches] = useState<ResponseBranch[]>([]);
    const [currentIndex, setCurrentIndex] = useState<number>(-1);
    const lastStoredId = useRef<string>('');

    // Load from sessionStorage on mount
    useEffect(() => {
        try {
            const stored = sessionStorage.getItem(STORAGE_KEY);
            if (stored) {
                const history: ResponseHistory = JSON.parse(stored);
                setBranches(history.branches || []);
                setCurrentIndex(history.currentIndex ?? -1);
            }
        } catch (error) {
            console.error('Failed to load response history:', error);
        }
    }, []);

    // Sync to sessionStorage whenever state changes
    useEffect(() => {
        try {
            const history: ResponseHistory = {
                branches,
                currentIndex,
            };
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(history));
        } catch (error) {
            console.error('Failed to save response history:', error);
        }
    }, [branches, currentIndex]);

    // Add a new branch
    const addBranch = useCallback((prompt: string, response: string) => {
        const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Prevent duplicate storage
        if (lastStoredId.current === response) {
            return;
        }
        lastStoredId.current = response;

        const newBranch: ResponseBranch = {
            id,
            prompt,
            response,
            timestamp: Date.now(),
        };

        setBranches(prev => {
            // If we're not at the end of history, append to end (don't remove forward history)
            // This creates branch 6 even if we're viewing branch 2
            const newBranches = [...prev, newBranch];
            
            // Maintain circular buffer: keep only last MAX_BRANCHES
            if (newBranches.length > MAX_BRANCHES) {
                return newBranches.slice(-MAX_BRANCHES);
            }
            return newBranches;
        });

        // Move to the newly added branch
        setCurrentIndex(prev => {
            const newLength = Math.min(branches.length + 1, MAX_BRANCHES);
            return newLength - 1;
        });
    }, [branches.length]);

    // Navigate to previous branch
    const goToPrevious = useCallback(() => {
        setCurrentIndex(prev => Math.max(0, prev - 1));
    }, []);

    // Navigate to next branch
    const goToNext = useCallback(() => {
        setCurrentIndex(prev => Math.min(branches.length - 1, prev + 1));
    }, [branches.length]);

    // Navigate to specific index
    const navigateToIndex = useCallback((index: number) => {
        if (index >= 0 && index < branches.length) {
            setCurrentIndex(index);
        }
    }, [branches.length]);

    // Clear all history
    const clearHistory = useCallback(() => {
        setBranches([]);
        setCurrentIndex(-1);
        lastStoredId.current = '';
        sessionStorage.removeItem(STORAGE_KEY);
    }, []);

    // Get current branch
    const currentBranch = currentIndex >= 0 && currentIndex < branches.length 
        ? branches[currentIndex] 
        : null;

    // Check if we can navigate
    const canGoBack = currentIndex > 0;
    const canGoForward = currentIndex < branches.length - 1;

    return {
        // State
        branches,
        currentIndex,
        currentBranch,
        totalBranches: branches.length,
        
        // Navigation state
        canGoBack,
        canGoForward,
        
        // Actions
        addBranch,
        goToPrevious,
        goToNext,
        navigateToIndex,
        clearHistory,
    };
}
