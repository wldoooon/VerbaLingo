"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Search, Clock, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSearchParams } from "@/context/SearchParamsContext"
import { useRouter } from "next/navigation"
import TextType from "@/components/TextType"

// Categories for filtering
const CATEGORIES = [
  { value: "General", label: "General" },
  { value: "Movies", label: "Movies" },
  { value: "TV", label: "TV Shows" },
  { value: "Games", label: "Games" },
  { value: "Books", label: "Books" },
  { value: "Music", label: "Music" },
] // Force rebuild 🚀

export default function SearchBar() {
  const [localQuery, setLocalQuery] = useState("")
  const { category: globalCategory, language, setLanguage } = useSearchParams()
  const [localCategory, setLocalCategory] = useState(globalCategory ?? "General")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [isRouting, setIsRouting] = useState(false)
  const searchBarRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  
  const { setQuery, setCategory } = useSearchParams()

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('recent_searches')
      if (stored) {
        setRecentSearches(JSON.parse(stored))
      }
    } catch {}
  }, [])

  // Click outside handler to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const saveToRecentSearches = (searchQuery: string) => {
    try {
      const trimmed = searchQuery.trim()
      if (!trimmed) return
      
      const updated = [trimmed, ...recentSearches.filter(s => s !== trimmed)].slice(0, 5)
      setRecentSearches(updated)
      localStorage.setItem('recent_searches', JSON.stringify(updated))
    } catch {}
  }

  const removeRecentSearch = (searchQuery: string) => {
    try {
      const updated = recentSearches.filter(s => s !== searchQuery)
      setRecentSearches(updated)
      localStorage.setItem('recent_searches', JSON.stringify(updated))
    } catch {}
  }

  const handleSearch = (searchQuery?: string) => {
    const queryToSearch = searchQuery || localQuery
    if (!queryToSearch.trim()) {
      return
    }
    
    try {
      localStorage.setItem('last_search_query', queryToSearch.trim())
    } catch {}
    
    // Save to recent searches
    saveToRecentSearches(queryToSearch)
    
    // Compute language segment for the routed page
    const trimmedQuery = queryToSearch.trim()
    const selectedCategory = localCategory === "General" ? null : localCategory
    setShowSuggestions(false)

    // Navigate to routed search page
    const languageSegment = selectedCategory ?? "General"
    setIsRouting(true)
    router.push(`/search/${encodeURIComponent(trimmedQuery)}/${encodeURIComponent(languageSegment)}`)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  // With routed search, fetch happens on the search results page. No local fetching here.

  return (
    <div ref={searchBarRef} className="relative w-full">
      {/* Fab.com-style Search Bar - Larger & More Visible */}
      <div className="relative group">
        <div className="absolute left-5 top-1/2 -translate-y-1/2 z-10">
          <Search className="h-5 w-5 text-muted-foreground/70" />
        </div>
        {/* Animated example text overlay using TextType when input is empty */}
        {!localQuery && (
          <div className="pointer-events-none absolute left-14 right-24 top-1/2 -translate-y-1/2 z-20 flex items-center">
            <TextType 
              text={[
                "hello, how are you today?",
                "مرحبا، أين يمكنني أن أجد محطة المترو؟",
                "guten Tag, ich hätte gerne ein Stück Kuchen",
                "bonjour, pouvez-vous m'aider à trouver cette adresse?",
                "你好，我想学习如何做这道菜",
                "thank you very much for your help",
                "أشعر بالجوع وأريد أن آكل شيئاً لذيذاً",
                "kannst du mir bitte den Weg zum Bahnhof erklären?",
                "excusez-moi, où se trouve la bibliothèque?",
                "今天天气真好，我们去公园散步吧",
                "where is the nearest restaurant?",
                "أحب القراءة في المساء مع فنجان من الشاي",
                "ich lerne seit einem Jahr Deutsch und es macht mir Spaß",
                "quelle est votre couleur préférée?",
                "请问，这附近有好的咖啡店吗？",
                "I would like to order coffee please",
                "ما رأيك في هذا الفيلم الجديد؟",
                "was machst du am Wochenende?",
                "j'aime voyager et découvrir de nouvelles cultures",
                "我喜欢听音乐和看电影",
                "what time is it?",
                "هل يمكنك أن تعطيني بعض النصائح؟",
                "wie war dein Tag heute?",
                "je dois aller à la banque cet après-midi",
                "明天我要去北京旅行",
                "привет, как дела?",
                "извините, вы не подскажете, где здесь туалет?",
                "я хочу выучить английский язык",
                "какая сегодня погода?",
                "спасибо большое за вашу помощь"
              ]}
              typingSpeed={75}
              pauseDuration={1500}
              showCursor={true}
              cursorCharacter="|"
              className="text-base text-muted-foreground/70"
            />
          </div>
        )}

        <input
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-haspopup="true"
          aria-expanded={showSuggestions}
          placeholder=""
          className={cn(
            "w-full h-12 pl-14 pr-5 text-base",
            "rounded-full",
            "bg-card",
            "border border-border/60",
            "text-foreground placeholder:text-muted-foreground/70",
            "transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50",
            "hover:bg-background hover:border-border/80",
            "shadow-sm hover:shadow-md focus:shadow-lg"
          )}
          value={localQuery}
          onChange={(e) => {
            setLocalQuery(e.target.value)
            setShowSuggestions(true)
          }}
          onKeyPress={handleKeyPress}
          onFocus={() => setShowSuggestions(true)}
          disabled={isRouting}
        />
        
        {/* Right-side action: show loader while routing, otherwise show Search button */}
        {isRouting ? (
          <div className="absolute right-5 top-1/2 -translate-y-1/2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground"></div>
              <span>Searching...</span>
            </div>
          </div>
        ) : (
          <button
            type="button"
            aria-label="Search"
            onClick={() => handleSearch()}
            disabled={!localQuery.trim()}
            className={cn(
              "absolute right-2.5 top-1/2 -translate-y-1/2",
              "inline-flex items-center gap-2 px-3 py-1.5",
              "rounded-full border",
              "bg-primary/90 text-primary-foreground border-primary/70",
              "backdrop-blur-md shadow-sm",
              "hover:bg-primary hover:shadow-md",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            <Search className="h-4 w-4" />
            <span className="text-sm font-medium hidden sm:inline">Search</span>
          </button>
        )}
      </div>

      {/* Fab-Style Suggestions Dropdown with Glassmorphism */}
      {showSuggestions && (
        <div className={cn(
          "absolute top-full left-0 right-0 mt-2 z-50",
          "bg-popover/80 backdrop-blur-xl",
          "border border-border/50",
          "rounded-2xl shadow-xl",
          "overflow-hidden",
          "animate-in fade-in-0 zoom-in-95 duration-200"
        )}>
          {/* Recent Searches Section */}
          {recentSearches.length > 0 && (
            <div className="p-3 border-b border-border/30">
              <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <Clock className="h-3.5 w-3.5" />
                Recent Searches
              </div>
              <div className="space-y-1">
                {recentSearches.map((search, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setLocalQuery(search)
                      handleSearch(search)
                    }}
                    className={cn(
                      "w-full flex items-center justify-between gap-3",
                      "px-4 py-2.5 rounded-xl",
                      "text-sm text-foreground text-left",
                      "hover:bg-accent/50 transition-colors duration-150",
                      "group/item"
                    )}
                  >
                    <span className="flex-1 truncate">{search}</span>
                    <span
                      role="button"
                      tabIndex={0}
                      aria-label={`Remove ${search} from recent searches`}
                      onClick={(e) => {
                        e.stopPropagation()
                        removeRecentSearch(search)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          e.stopPropagation()
                          removeRecentSearch(search)
                        }
                      }}
                      className="opacity-0 group-hover/item:opacity-100 p-1 hover:bg-destructive/10 rounded-md transition-opacity cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Category Filters Section */}
          <div className="p-4">
            <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Filter by Category
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => {
                    setLocalCategory(cat.value)
                    if (localQuery.trim()) {
                      handleSearch()
                    }
                  }}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium",
                    "border transition-all duration-200",
                    localCategory === cat.value
                      ? "bg-primary text-primary-foreground border-primary shadow-md"
                      : "bg-background/50 text-foreground border-border/40 hover:bg-accent/50 hover:border-border/60"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
