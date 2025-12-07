"use client"

import React, { useState, useRef, useEffect } from 'react';
import { Search, X, ArrowRight, ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useSearchParams } from '@/context/SearchParamsContext';
import { motion } from 'framer-motion';
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

// Animated Filter Icon
const AnimatedFilterIcon = ({ isOpen, className }: { isOpen: boolean; className?: string }) => (
  <motion.svg
    className={className}
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <motion.line x1="4" y1="6" x2="20" y2="6" animate={{ x2: isOpen ? 16 : 20 }} transition={{ duration: 0.2 }} />
    <motion.line x1="4" y1="12" x2="20" y2="12" animate={{ x1: isOpen ? 8 : 4, x2: isOpen ? 16 : 20 }} transition={{ duration: 0.2 }} />
    <motion.line x1="4" y1="18" x2="20" y2="18" animate={{ x1: isOpen ? 10 : 4, x2: isOpen ? 14 : 20 }} transition={{ duration: 0.2 }} />
  </motion.svg>
);

export default function SearchBarNew() {
  const [query, setQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['All']);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [activeMenu, setActiveMenu] = useState<'none' | 'category' | 'language'>('none');
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showRecent, setShowRecent] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { language, setLanguage } = useSearchParams();

  // Load recent searches
  useEffect(() => {
    try {
      const stored = localStorage.getItem('recent_searches');
      if (stored) setRecentSearches(JSON.parse(stored));
    } catch {}
  }, []);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setActiveMenu('none');
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
    } catch {}
  };

  const handleSearch = (searchQuery?: string) => {
    const q = searchQuery || query;
    if (!q.trim()) return;
    
    saveToRecent(q);
    setActiveMenu('none');
    setShowRecent(false);
    setIsSearching(true);
    router.push(`/watch/${encodeURIComponent(q.trim())}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const isExpanded = activeMenu !== 'none' || showRecent;

  return (
    <div className="w-full max-w-3xl relative z-30" ref={containerRef}>
      <div className={cn(
        "relative flex items-center w-full bg-card rounded-2xl transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] p-1.5 border",
        isExpanded 
          ? "rounded-b-none shadow-2xl shadow-primary/10 border-border ring-1 ring-border/50" 
          : "shadow-lg border-border hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-0.5"
      )}>
        
        {/* Category Selector */}
        <div className="relative shrink-0">
          <button
            onClick={() => {
              setActiveMenu(prev => prev === 'category' ? 'none' : 'category');
              setShowRecent(false);
            }}
            className={cn(
              "h-11 px-3 rounded-xl flex items-center gap-2 text-sm font-semibold transition-all duration-200",
              activeMenu === 'category' ? 'bg-muted text-foreground' : 'hover:bg-muted/50 text-muted-foreground'
            )}
          >
            <AnimatedFilterIcon 
              isOpen={activeMenu === 'category'}
              className={cn("w-4 h-4", activeMenu === 'category' ? 'text-primary' : 'text-muted-foreground')}
            />
            <span className="hidden sm:inline">{getCategoryLabel()}</span>
            <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", activeMenu === 'category' ? 'rotate-180' : '')} />
          </button>

          {/* Category Dropdown */}
          {activeMenu === 'category' && (
            <div className="absolute top-full left-0 mt-2 w-56 bg-card rounded-xl shadow-xl border border-border p-2 z-50 animate-in fade-in-0 zoom-in-95">
              <div className="text-[10px] font-bold text-muted-foreground px-3 py-2 uppercase tracking-wider">Search Context</div>
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategories.includes(cat.value);
                return (
                  <button
                    key={cat.value}
                    onClick={() => toggleCategory(cat.value)}
                    className={cn(
                      "w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-between",
                      isSelected 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-foreground hover:bg-muted'
                    )}
                  >
                    <span>{cat.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-primary" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-border mx-2 hidden sm:block" />

        {/* Input */}
        <div className="flex-1 relative flex items-center">
          {/* Animated placeholder when empty */}
          {!query && (
            <div className="pointer-events-none absolute left-3 right-12 flex items-center">
              <TextType
                text={[
                  "hello, how are you today?",
                  "مرحبا، أين يمكنني أن أجد محطة المترو؟",
                  "guten Tag, ich hätte gerne ein Stück Kuchen",
                  "bonjour, pouvez-vous m'aider?",
                  "你好，我想学习如何做这道菜",
                  "thank you very much for your help",
                  "where is the nearest restaurant?",
                  "I would like to order coffee please",
                  "what time is it?",
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
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              setShowRecent(true);
              setActiveMenu('none');
            }}
            onKeyDown={handleKeyDown}
            placeholder=""
            className="w-full bg-transparent border-none focus:ring-0 text-foreground placeholder-muted-foreground h-11 px-3 text-base font-medium outline-none"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="absolute right-2 p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Language Selector */}
        <div className="relative shrink-0">
          <button
            onClick={() => {
              setActiveMenu(prev => prev === 'language' ? 'none' : 'language');
              setShowRecent(false);
            }}
            className={cn(
              "h-10 px-2 sm:px-3 rounded-lg flex items-center gap-2 transition-all text-xs font-bold uppercase tracking-wide",
              activeMenu === 'language' ? 'bg-primary/10 text-primary' : 'hover:bg-muted/50 text-muted-foreground'
            )}
          >
            <div className="w-5 h-5 rounded-full overflow-hidden shadow-sm border border-border flex-shrink-0">
              <img 
                src={LANGUAGES.find(l => l.value === selectedLanguage)?.flag || LANGUAGES[0].flag}
                alt={selectedLanguage}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="hidden sm:inline">{selectedLanguage}</span>
          </button>

          {/* Language Dropdown */}
          {activeMenu === 'language' && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-card rounded-xl shadow-xl border border-border p-2 z-50 animate-in fade-in-0 zoom-in-95">
              <div className="text-[10px] font-bold text-muted-foreground px-3 py-2 uppercase tracking-wider">Language</div>
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.value}
                  onClick={() => {
                    setSelectedLanguage(lang.value);
                    setLanguage(lang.value);
                    setActiveMenu('none');
                    inputRef.current?.focus();
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-between",
                    selectedLanguage === lang.value 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-foreground hover:bg-muted'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full overflow-hidden shadow-sm border border-border flex-shrink-0">
                      <img 
                        src={lang.flag}
                        alt={lang.value}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span>{lang.label}</span>
                  </div>
                  {selectedLanguage === lang.value && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search Button */}
        <button
          onClick={() => handleSearch()}
          disabled={!query.trim() || isSearching}
          className={cn(
            "h-11 w-11 rounded-xl transition-all duration-300 ease-out flex items-center justify-center shadow-lg shrink-0",
            query.trim() 
              ? 'bg-primary text-primary-foreground shadow-primary/30 hover:bg-primary/90 hover:scale-105 active:scale-95' 
              : 'bg-muted text-muted-foreground shadow-none'
          )}
        >
          {isSearching ? (
            <div className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
          ) : (
            <ArrowRight className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Recent Searches Dropdown */}
      {showRecent && recentSearches.length > 0 && activeMenu === 'none' && (
        <div className="absolute top-full left-0 right-0 bg-card rounded-b-2xl shadow-xl shadow-primary/10 border border-t-0 border-border overflow-hidden z-20 animate-in fade-in-0 zoom-in-95">
          <div className="py-2">
            <div className="text-[10px] font-bold text-muted-foreground px-4 py-2 uppercase tracking-wider">Recent Searches</div>
            {recentSearches.map((search, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuery(search);
                  handleSearch(search);
                }}
                className="w-full text-left px-4 py-3 hover:bg-muted/50 flex items-center gap-4 text-muted-foreground group transition-colors"
              >
                <Search className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                <span className="flex-1 font-medium text-foreground">{search}</span>
                <ArrowRight className="w-4 h-4 text-transparent group-hover:text-muted-foreground -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
