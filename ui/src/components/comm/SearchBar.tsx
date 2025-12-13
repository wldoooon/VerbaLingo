"use client"

import React, { useState, useRef, useEffect } from 'react';
import { Search, X, ArrowRight, ChevronDown, Check, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter, usePathname } from 'next/navigation';
import { useSearchParams } from '@/context/SearchParamsContext';
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

// Categories for filtering
const CATEGORIES = [
    { value: 'All', label: 'All' },
    { value: 'Movies', label: 'Movies' },
    { value: 'TV', label: 'TV Shows' },
    { value: 'Podcasts', label: 'Podcasts' },
    { value: 'Music', label: 'Music' },
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

    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const pathname = usePathname();
    const { setLanguage } = useSearchParams();

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
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleCategory = (cat: string) => {
        if (cat === 'All') {
            setSelectedCategories(['All']);
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

        const targetPath = `/watch/${encodeURIComponent(q.trim())}`;

        // Check if we are already on the target page. 
        // If yes, we don't show the spinner because navigation won't trigger a pathname change effect to clear it.
        // TanStack Query will handle background refetching if data is stale.
        if (pathname === decodeURIComponent(targetPath) || pathname === targetPath) {
            router.push(targetPath);
            return;
        }

        saveToRecent(q);
        setShowRecent(false);
        setIsSearching(true);
        router.push(targetPath);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSearch();
    };

    return (
        <div className="w-full max-w-3xl relative z-30" ref={containerRef}>
            <div className={cn(
                "group relative rounded-xl transition-all duration-300 ease-in-out p-[1.5px]",
                showRecent && recentSearches.length > 0
                    ? "rounded-b-none"
                    : "hover:-translate-y-0.5"
            )}>
                {/* Static Border (Fades out when focused) */}
                <div className="absolute inset-0 rounded-xl border border-border group-focus-within:border-transparent transition-colors pointer-events-none" />

                {/* Animated Gradient Border Layer */}
                <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 p-[1.5px] [mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] [mask-composite:exclude]">
                    <div className="absolute top-0 h-full w-1/2 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-border-flow" />
                </div>

                {/* Inner Content */}
                <div className="relative z-10 bg-muted/20 backdrop-blur-md rounded-[10px] flex flex-row items-center p-1 w-full h-full">

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
                            onChange={(e) => setQuery(e.target.value)}
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
                                        setLanguage(lang.value);
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

            {/* Recent Searches Panel */}
            {showRecent && recentSearches.length > 0 && (
                <Card className="absolute top-full left-0 right-0 mt-0 rounded-t-none rounded-b-2xl shadow-xl border-t-0 animate-in fade-in-0 zoom-in-95 z-20 bg-muted/20 backdrop-blur-md">
                    <CardContent className="p-2">
                        <div className="text-[10px] font-bold text-muted-foreground px-4 py-2 uppercase tracking-wider flex items-center gap-2">
                            <Clock className="w-3 h-3" /> Recent Searches
                        </div>
                        {recentSearches.map((search, idx) => (
                            <Button
                                key={idx}
                                variant="ghost"
                                onClick={() => {
                                    setQuery(search);
                                    handleSearch(search);
                                }}
                                className="w-full justify-start h-auto py-3 px-4 font-normal text-muted-foreground hover:text-primary group"
                            >
                                <Search className="w-4 h-4 mr-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                                <span className="flex-1 text-left text-foreground">{search}</span>
                                <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:translate-x-0 group-hover:opacity-100 transition-all text-muted-foreground" />
                            </Button>
                        ))}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
