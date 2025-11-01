"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSearch } from "@/lib/useApi"
import { usePlayerContext } from "@/context/PlayerContext"
import { useSearchParams } from "@/context/SearchParamsContext"

export default function SearchBar() {
  const [localQuery, setLocalQuery] = useState("")
  const [localCategory, setLocalCategory] = useState("General")
  
  const { query, category, setQuery, setCategory } = useSearchParams()
  const { dispatch } = usePlayerContext()
  
  const { data, error, isLoading, refetch } = useSearch(
    query,
    category,
  )

  const handleSearch = () => {
    if (!localQuery.trim()) {
      return
    }
    try {
      localStorage.setItem('last_search_query', localQuery.trim())
    } catch {}
    
    // Update global search params first
    const trimmedQuery = localQuery.trim()
    const selectedCategory = localCategory === "General" ? null : localCategory
    
    setQuery(trimmedQuery)
    setCategory(selectedCategory)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  useEffect(() => {
    // Trigger search when query changes and it's not empty
    if (query && query.trim()) {
      refetch()
    }
  }, [query, category, refetch])

  useEffect(() => {
    if (data) {
      // Reset video index when new search results arrive
      dispatch({ type: "RESET_INDEX" })
    }
  }, [data, dispatch])

  return (
    <div className="relative w-full">
      {/* Fab.com-style Search Bar - Larger & More Visible */}
      <div className="relative group">
        <div className="absolute left-5 top-1/2 -translate-y-1/2 z-10">
          <Search className="h-5 w-5 text-muted-foreground/70" />
        </div>
        <input
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-haspopup="true"
          aria-expanded="false"
          placeholder="Search for a word..."
          className={cn(
            "w-full h-12 pl-14 pr-5 text-base",
            "rounded-full",
            "bg-card/90 backdrop-blur-md",
            "border border-border/60",
            "text-foreground placeholder:text-muted-foreground/70",
            "transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50",
            "hover:bg-background hover:border-border/80",
            "shadow-sm hover:shadow-md focus:shadow-lg"
          )}
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
        />
        
        {/* Loading indicator inside the input */}
        {isLoading && (
          <div className="absolute right-5 top-1/2 -translate-y-1/2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground"></div>
              <span>Searching...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
