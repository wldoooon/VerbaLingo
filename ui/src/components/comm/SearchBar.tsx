"use client"

import React, { useState, useRef, useEffect } from 'react';
import { Search, X, ArrowRight, ChevronDown, Check, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter, usePathname } from 'next/navigation';
import { useSearchStore } from '@/store/useSearchStore';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem,
    DropdownMenuSeparator,
    DropdownMenuLabel,
    DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent } from '@/components/ui/card';
import TextType from '@/components/TextType';
import { useDatamuse } from '@/hooks/useDatamuse';

// Categories for filtering
const CATEGORIES = [
    { value: 'All', label: 'All' },
    { value: 'Movies', label: 'Movies' },
    { value: 'Cartoons', label: 'TV Shows' },
    { value: 'Podcasts', label: 'Podcasts' },
    { value: 'Talks', label: 'Music' },
];

// Languages with flags
const LANGUAGES = [
    { value: 'English', label: 'English', flag: 'https://flagcdn.com/us.svg' },
    { value: 'Spanish', label: 'Español', flag: 'https://flagcdn.com/es.svg' },
    { value: 'French', label: 'Français', flag: 'https://flagcdn.com/fr.svg' },
    { value: 'German', label: 'Deutsch', flag: 'https://flagcdn.com/de.svg' },
    { value: 'Japanese', label: '日本語', flag: 'https://flagcdn.com/jp.svg' },
    { value: 'Chinese', label: '中文', flag: 'https://flagcdn.com/cn.svg' },
];

export function SearchBar() {
    const [query, setQuery] = useState('');
    const [selectedCategories, setSelectedCategories] = useState<string[]>(['All']);
    const [selectedLanguage, setSelectedLanguage] = useState('English');
    const [isSearching, setIsSearching] = useState(false);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [showRecent, setShowRecent] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);

    const { suggestions, isLoading } = useDatamuse(query);

    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const pathname = usePathname();

    // Zustand Store
    const storeLanguage = useSearchStore(s => s.language);
    const { setLanguage: setStoreLanguage, setCategory: setStoreCategory } = useSearchStore();

    // Sync local language state to store if they differ
    useEffect(() => {
        if (storeLanguage && storeLanguage.toLowerCase() !== selectedLanguage.toLowerCase()) {
            // Capitalize for UI
            const capitalized = storeLanguage.charAt(0).toUpperCase() + storeLanguage.slice(1);
            setSelectedLanguage(capitalized);
        }
    }, [storeLanguage, selectedLanguage]);

    // Sync selected categories to global store
    useEffect(() => {
        const cats = selectedCategories.includes('All') ? null : selectedCategories.join(',')
        setStoreCategory(cats)
    }, [selectedCategories, setStoreCategory])

    // Reset searching state on path change
    useEffect(() => {
        setIsSearching(false);
    }, [pathname]);

    // Load recent searches
    useEffect(() => {
        try {
            const stored = localStorage.getItem('recent_searches');
            if (stored) setRecentSearches(JSON.parse(stored));
        } catch { }
    }, []);

    // Click outside to close recent
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowRecent(false);
                setActiveIndex(-1);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleCategory = (cat: string) => {
        if (cat === 'All') {
            setSelectedCategories(['All']);
            // Push to URL: clear category param
            const params = new URLSearchParams(window.location.search);
            params.delete('category');
            params.delete('i'); // Reset index on filter change
            router.push(`${pathname}?${params.toString()}`);
            return;
        }

        let newCats = selectedCategories.includes('All') ? [] : [...selectedCategories];
        if (newCats.includes(cat)) {
            newCats = newCats.filter(c => c !== cat);
        } else {
            newCats.push(cat);
        }
        if (newCats.length === 0) newCats = ['All'];
        setSelectedCategories(newCats);

        // Push to URL
        if (pathname.startsWith('/search')) {
            const params = new URLSearchParams(window.location.search);
            const catString = newCats.includes('All') ? null : newCats.join(',');
            if (catString) params.set('category', catString);
            else params.delete('category');
            params.delete('i'); // Reset index
            router.push(`${pathname}?${params.toString()}`);
        }
    };

    const isCategorySelected = (cat: string) => {
        return selectedCategories.includes(cat);
    }

    const getCategoryLabel = () => {
        if (selectedCategories.includes('All')) return 'All';
        if (selectedCategories.length === 1) return selectedCategories[0];
        return `${selectedCategories.length} Selected`;
    };

    const saveToRecent = (q: string) => {
        try {
            const trimmed = q.trim();
            if (!trimmed) return;
            const updated = [trimmed, ...recentSearches.filter(s => s !== trimmed)].slice(0, 5);
            setRecentSearches(updated);
            localStorage.setItem('recent_searches', JSON.stringify(updated));
        } catch { }
    };

    const handleSearch = (searchQuery?: string) => {
        const q = searchQuery || query;
        if (!q.trim()) return;

        // Use the selected language (lowercase) for the URL path
        const lang = selectedLanguage.toLowerCase();

        // Build query params including categories
        const params = new URLSearchParams();
        const cats = selectedCategories.includes('All') ? null : selectedCategories.join(',');
        if (cats) params.set('category', cats);

        const targetPath = `/search/${encodeURIComponent(q.trim())}/${lang}`;
        const targetUrl = params.toString() ? `${targetPath}?${params.toString()}` : targetPath;

        if (pathname === decodeURIComponent(targetPath) || pathname === targetPath) {
            router.push(targetUrl);
            return;
        }

        saveToRecent(q);
        setShowRecent(false);
        setIsSearching(true);
        router.push(targetUrl);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (suggestions.length > 0) {
                setActiveIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (suggestions.length > 0) {
                setActiveIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
            }
        } else if (e.key === 'Enter') {
            if (activeIndex >= 0 && suggestions[activeIndex]) {
                e.preventDefault();
                const selected = suggestions[activeIndex].word;
                setQuery(selected);
                handleSearch(selected);
                setActiveIndex(-1);
            } else {
                handleSearch();
            }
        } else if (e.key === 'Escape') {
            setActiveIndex(-1);
            setShowRecent(false);
            // Optional: blur input if desired, or just close dropdowns
        }
    };

    return (
        <div className="w-full max-w-3xl relative z-30" ref={containerRef}>
            <div className={cn(
                "group relative rounded-xl transition-all duration-300 ease-in-out border border-blue-500/40 overflow-hidden",
                showRecent && recentSearches.length > 0
                    ? "rounded-b-none"
                    : "hover:-translate-y-0.5"
            )}>
                {/* Inner Content */}
                <div className="relative z-10 bg-muted/20 backdrop-blur-md flex flex-row items-center p-1 w-full h-full">

                    {/* Category Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className={cn(
                                    "h-9 px-3 rounded-lg gap-2 font-semibold text-muted-foreground hover:bg-muted/50 data-[state=open]:bg-muted data-[state=open]:text-foreground",
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    {/* Animated Filter Icon Replacement */}
                                    <svg
                                        className={cn("w-4 h-4 transition-colors")}
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <line x1="4" y1="6" x2="20" y2="6" />
                                        <line x1="4" y1="18" x2="12" y2="18" />
                                    </svg>
                                    <span className="hidden md:inline">{getCategoryLabel()}</span>
                                    <ChevronDown className="w-4 h-4 opacity-50" />
                                </div>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-[200px] p-2 rounded-xl" sideOffset={8}>
                            <DropdownMenuLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-2 py-1.5">
                                Search Context
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                {CATEGORIES.map((cat) => (
                                    <DropdownMenuCheckboxItem
                                        key={cat.value}
                                        checked={isCategorySelected(cat.value)}
                                        onCheckedChange={() => toggleCategory(cat.value)}
                                        className="rounded-lg py-2.5 cursor-pointer"
                                    >
                                        {cat.label}
                                    </DropdownMenuCheckboxItem>
                                ))}
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Divider */}
                    <div className="w-px h-6 bg-border mx-2 hidden sm:block" />

                    {/* Unified Input Area */}
                    <div className="flex-1 relative flex items-center min-w-0">
                        {/* Animated placeholder */}
                        {!query && (
                            <div className="pointer-events-none absolute left-3 right-12 flex items-center top-1/2 -translate-y-1/2 overflow-hidden">
                                <TextType
                                    text={[
                                        "hello, how are you today?",
                                        "مرحبا، أين يمكنني أن أجد محطة المترو؟",
                                        "guten Tag, ich hätte gerne ein Stück Kuchen",
                                        "bonjour, pouvez-vous m'aider?",
                                        "你好，我想学习如何做这道菜",
                                    ]}
                                    typingSpeed={75}
                                    pauseDuration={1500}
                                    showCursor={true}
                                    cursorCharacter="|"
                                    className="text-sm text-muted-foreground/50 font-normal whitespace-nowrap"
                                />
                            </div>
                        )}

                        <Input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                setShowRecent(true);
                            }}
                            onFocus={() => setShowRecent(true)}
                            onKeyDown={handleKeyDown}
                            className="border-0 shadow-none focus-visible:ring-0 px-3 h-9 text-base font-medium placeholder:text-transparent min-w-0"
                        />

                        {query && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                    setQuery('');
                                    inputRef.current?.focus();
                                }}
                                className="h-7 w-7 rounded-full absolute right-2 text-muted-foreground hover:bg-muted"
                            >
                                <X className="w-3.5 h-3.5" />
                            </Button>
                        )}
                    </div>

                    {/* Language Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className={cn(
                                    "h-9 px-2 sm:px-3 rounded-lg gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground hover:bg-muted/50 data-[state=open]:bg-muted data-[state=open]:text-foreground mr-1"
                                )}
                            >
                                <div className="w-5 h-5 rounded-full overflow-hidden shadow-sm border border-border flex-shrink-0">
                                    <img
                                        src={LANGUAGES.find(l => l.value === selectedLanguage)?.flag || LANGUAGES[0].flag}
                                        alt={selectedLanguage}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <span className="hidden md:inline">{selectedLanguage}</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[180px] p-2 rounded-xl" sideOffset={8}>
                            <DropdownMenuLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-2 py-1.5">
                                Language
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {LANGUAGES.map((lang) => (
                                <DropdownMenuItem
                                    key={lang.value}
                                    onClick={() => {
                                        setSelectedLanguage(lang.value);
                                        setStoreLanguage(lang.value);

                                        // If we are already on a search page, update the URL immediately
                                        if (pathname.startsWith('/search/')) {
                                            const pathParts = pathname.split('/');
                                            // pathParts = ['', 'search', 'query', 'old-lang']
                                            if (pathParts.length >= 4) {
                                                const searchQ = pathParts[2];
                                                const newLang = lang.value.toLowerCase();
                                                router.push(`/search/${searchQ}/${newLang}${window.location.search}`);
                                            }
                                        }
                                    }}
                                    className={cn(
                                        "rounded-lg py-2.5 cursor-pointer flex items-center justify-between",
                                        selectedLanguage === lang.value && "bg-accent text-accent-foreground"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-full overflow-hidden shadow-sm border border-border/50">
                                            <img src={lang.flag} alt={lang.value} className="w-full h-full object-cover" />
                                        </div>
                                        <span className="text-sm font-medium">{lang.label}</span>
                                    </div>
                                    {selectedLanguage === lang.value && <Check className="w-4 h-4 ml-2" />}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Search Action Button */}
                    <Button
                        size="icon"
                        onClick={() => handleSearch()}
                        disabled={!query.trim() || isSearching}
                        className={cn(
                            "h-9 w-9 rounded-lg shadow-lg transition-all duration-300 shrink-0",
                            query.trim()
                                ? 'bg-primary text-primary-foreground hover:scale-105 hover:bg-primary/90'
                                : 'bg-muted text-muted-foreground shadow-none'
                        )}
                    >
                        {isSearching ? (
                            <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                        ) : (
                            <ArrowRight className="w-4 h-4" />
                        )}
                    </Button>
                </div>
            </div>

            {/* Unified Suggestions & Recents Panel */}
            {showRecent && !isSearching && (recentSearches.length > 0 || (query.length >= 2 && (suggestions.length > 0 || isLoading))) && (
                <Card className="absolute top-full left-0 right-0 mt-0 rounded-t-none rounded-b-2xl shadow-xl border-t-0 animate-in fade-in-0 zoom-in-95 z-30 bg-background/95 backdrop-blur-md overflow-hidden">
                    <CardContent className="p-0">
                        {/* 1. Autocomplete Suggestions */}
                        {query.length >= 2 && !isSearching && (
                            <div className="p-1">
                                {isLoading ? (
                                    <div className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground">
                                        <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                                        <span>Searching...</span>
                                    </div>
                                ) : suggestions.length > 0 ? (
                                    suggestions.map((suggestion, idx) => (
                                        <Button
                                            key={suggestion.word}
                                            variant="ghost"
                                            onClick={() => {
                                                setQuery(suggestion.word);
                                                handleSearch(suggestion.word);
                                                setActiveIndex(-1);
                                            }}
                                            className={cn(
                                                "w-full justify-start h-auto py-2.5 px-4 font-normal text-foreground/80 hover:text-primary hover:bg-muted/50 transition-colors",
                                                activeIndex === idx && "bg-muted text-primary"
                                            )}
                                        >
                                            <Search className="w-4 h-4 mr-3 opacity-40" />
                                            <span className="flex-1 text-left">
                                                {suggestion.word}
                                            </span>
                                        </Button>
                                    ))
                                ) : null}
                            </div>
                        )}

                        {/* Separator if both exist */}
                        {query.length >= 2 && suggestions.length > 0 && !isSearching && recentSearches.length > 0 && (
                            <div className="h-px bg-border/50 mx-2 my-1" />
                        )}

                        {/* 2. Recent Searches */}
                        {recentSearches.length > 0 && (
                            <div className="p-1">
                                <div className="text-[10px] font-bold text-muted-foreground px-4 py-2 uppercase tracking-wider flex items-center gap-2">
                                    <Clock className="w-3 h-3" /> Recent
                                </div>
                                {recentSearches.slice(0, 3).map((search, idx) => (
                                    <Button
                                        key={idx}
                                        variant="ghost"
                                        onClick={() => {
                                            setQuery(search);
                                            handleSearch(search);
                                            setActiveIndex(-1);
                                        }}
                                        className="w-full justify-start h-auto py-2 px-4 font-normal text-muted-foreground hover:text-primary group"
                                    >
                                        <ArrowRight className="w-4 h-4 mr-3 opacity-30 group-hover:opacity-100 transition-opacity" />
                                        <span className="flex-1 text-left">{search}</span>
                                    </Button>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
