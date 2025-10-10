"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Check, ChevronsUpDown, Search, Languages } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/animate-ui/components/radix/dialog"
import { useSearch } from "@/lib/useApi"
import { usePlayerContext } from "@/context/PlayerContext"
import { useSearchParams } from "@/context/SearchParamsContext"

export default function SearchBar() {
  const [open, setOpen] = useState(false)
  const [localQuery, setLocalQuery] = useState("")
  const [localCategory, setLocalCategory] = useState("General")
  const [language, setLanguage] = useState("English")
  
  const { query, category, setQuery, setCategory } = useSearchParams()
  const { dispatch } = usePlayerContext()
  
  const { data, error, isLoading, refetch } = useSearch(
    query,
    category,
  )

  const categories = [
    { value: "General", label: "General" },
    { value: "movies", label: "Movies" },
    { value: "tv", label: "TV Shows" },
    { value: "games", label: "Games" },
    { value: "books", label: "Books" },
    { value: "music", label: "Music" },
  ]

  const languages = [
    { value: "English", label: "English" },
    { value: "Spanish", label: "Spanish" },
    { value: "French", label: "French" },
    { value: "German", label: "German" },
    { value: "Japanese", label: "Japanese" },
  ]

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
      // Close dialog after a successful search
      if (data.hits.length > 0) {
        setOpen(false)
      }
    }
  }, [data, dispatch])

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full h-10 justify-between text-muted-foreground cursor-text hover:bg-transparent hover:text-muted-foreground rounded-full">
          Search for a word...
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent
        className="p-0 gap-0 max-w-lg rounded-2xl overflow-hidden shadow-2xl"
        overlayClassName="backdrop-blur-md bg-black/60"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Search for video clips</DialogTitle>
            <div className="flex items-center gap-2 p-3">
              <Search className="h-5 w-5 text-muted-foreground ml-1" />
              <Input
                type="text"
                placeholder="Search for a word..."
                className="w-full h-10 border-none bg-transparent p-0 text-base focus-visible:ring-0 focus-visible:ring-offset-0"
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                autoFocus
              />
              <Button onClick={handleSearch} disabled={isLoading} className="mr-1 rounded-full">
                {isLoading ? "Searching..." : "Search"}
              </Button>
            </div>
            <div className="p-4 border-t bg-muted/50 min-h-[100px] flex items-center justify-center">
              {isLoading && <p className="text-sm text-muted-foreground">Searching...</p>}
              {error && <p className="text-center text-sm text-destructive">{error.message}</p>}
              {data && !isLoading && (
                <div className="w-full flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Found <span className="font-bold text-foreground">{data.total}</span> clips.
                  </p>
                  <div className="flex items-center gap-4">
                    <CategoryPicker categories={categories} value={localCategory} onChange={setLocalCategory} />
                    <LanguagePicker languages={languages} value={language} onChange={setLanguage} />
                  </div>
                </div>
              )}
              {!isLoading && !error && !data && (
                <div className="text-center text-sm text-muted-foreground">
                  <p className="mb-2">Enter a word to find video clips.</p>
                  <div className="flex items-center justify-center gap-4">
                    <CategoryPicker categories={categories} value={localCategory} onChange={setLocalCategory} />
                    <LanguagePicker languages={languages} value={language} onChange={setLanguage} />
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
    </Dialog>
  )
}

type Item = { value: string; label: string }

function CategoryPicker({ categories, value, onChange }: { categories: Item[]; value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-muted-foreground">Category</span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            role="combobox"
            aria-expanded={open}
            className="flex shrink-0 items-center rounded-full bg-background border px-2 py-1 text-xs font-semibold text-foreground cursor-pointer"
          >
            {value}
            <ChevronsUpDown className="ml-1 h-3 w-3 opacity-50" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[180px] p-0">
          <Command>
            <CommandInput placeholder="Filter..." className="h-9" />
            <CommandList>
              <CommandEmpty>No category found.</CommandEmpty>
              <CommandGroup>
                {categories.map((cat) => (
                  <CommandItem
                    key={cat.value}
                    value={cat.value}
                    onSelect={() => {
                      onChange(cat.label)
                      setOpen(false)
                    }}
                  >
                    {cat.label}
                    <Check className={cn("ml-auto h-4 w-4", value === cat.label ? "opacity-100" : "opacity-0")} />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}

function LanguagePicker({ languages, value, onChange }: { languages: Item[]; value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="flex items-center gap-1.5">
      <Languages className="w-3.5 h-3.5 text-muted-foreground" />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            role="combobox"
            aria-expanded={open}
            className="flex shrink-0 items-center rounded-full bg-background border px-2 py-1 text-xs font-semibold text-foreground cursor-pointer"
          >
            {value}
            <ChevronsUpDown className="ml-1 h-3 w-3 opacity-50" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[180px] p-0">
          <Command>
            <CommandInput placeholder="Filter..." className="h-9" />
            <CommandList>
              <CommandEmpty>No language found.</CommandEmpty>
              <CommandGroup>
                {languages.map((lang) => (
                  <CommandItem
                    key={lang.value}
                    value={lang.value}
                    onSelect={() => {
                      onChange(lang.label)
                      setOpen(false)
                    }}
                  >
                    {lang.label}
                    <Check className={cn("ml-auto h-4 w-4", value === lang.label ? "opacity-100" : "opacity-0")} />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}