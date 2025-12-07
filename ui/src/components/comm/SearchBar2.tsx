import React, { useState, useRef, useEffect } from 'react';
import { 
  SearchIcon, 
  XIcon, 
  ArrowRightIcon, 
  ChevronDownIcon, 
  AnimatedFilterIcon, 
  CheckIcon 
} from './Icons';
import { SearchCategory, SearchLanguage } from '@/lib/types';

interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  onSearch: (query: string) => void;
  isSearching: boolean;
  suggestions: string[];
  showSuggestions: boolean;
  setShowSuggestions: (show: boolean) => void;
  selectedCategories: SearchCategory[];
  onCategoriesChange: (categories: SearchCategory[]) => void;
  selectedLanguage: SearchLanguage;
  onLanguageChange: (language: SearchLanguage) => void;
  onFocus: () => void;
}

const getLanguageFlag = (lang: SearchLanguage) => {
  switch (lang) {
    case SearchLanguage.ENGLISH: return 'https://flagcdn.com/us.svg';
    case SearchLanguage.SPANISH: return 'https://flagcdn.com/es.svg';
    case SearchLanguage.FRENCH: return 'https://flagcdn.com/fr.svg';
    case SearchLanguage.GERMAN: return 'https://flagcdn.com/de.svg';
    case SearchLanguage.JAPANESE: return 'https://flagcdn.com/jp.svg';
    case SearchLanguage.CHINESE: return 'https://flagcdn.com/cn.svg';
    default: return '';
  }
};

const getLanguageLabel = (lang: SearchLanguage) => {
    switch (lang) {
        case SearchLanguage.ENGLISH: return 'English';
        case SearchLanguage.SPANISH: return 'Español';
        case SearchLanguage.FRENCH: return 'Français';
        case SearchLanguage.GERMAN: return 'Deutsch';
        case SearchLanguage.JAPANESE: return '日本語';
        case SearchLanguage.CHINESE: return '中文';
        default: return lang;
    }
}

export const SearchBar: React.FC<SearchBarProps> = ({
  query,
  onQueryChange,
  onSearch,
  isSearching,
  suggestions,
  showSuggestions,
  setShowSuggestions,
  selectedCategories,
  onCategoriesChange,
  selectedLanguage,
  onLanguageChange,
  onFocus
}) => {
  const [activeMenu, setActiveMenu] = useState<'none' | 'category' | 'language'>('none');
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Click outside to close menus and suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setActiveMenu('none');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setShowSuggestions]);

  const toggleMenu = (menu: 'category' | 'language') => {
    setActiveMenu(prev => prev === menu ? 'none' : menu);
    if (showSuggestions) setShowSuggestions(false);
  };

  const toggleCategory = (cat: SearchCategory) => {
    // Case 1: Selecting "All"
    if (cat === SearchCategory.ALL) {
      onCategoriesChange([SearchCategory.ALL]);
      return;
    }
    
    // Case 2: Selecting specific category
    let newCats = selectedCategories.includes(SearchCategory.ALL) ? [] : [...selectedCategories];

    if (newCats.includes(cat)) {
        newCats = newCats.filter(c => c !== cat);
    } else {
        newCats.push(cat);
    }

    // Case 3: If nothing is left selected, revert to "All"
    if (newCats.length === 0) {
        newCats = [SearchCategory.ALL];
    }

    onCategoriesChange(newCats);
  };

  const getCategoryLabel = () => {
    if (selectedCategories.includes(SearchCategory.ALL)) return 'All';
    if (selectedCategories.length === 1) return selectedCategories[0];
    return `${selectedCategories.length} Selected`;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch(query);
      setActiveMenu('none');
    }
  };

  return (
    <div className="w-full max-w-3xl relative z-30" ref={containerRef}>
      <div className={`
        relative flex items-center w-full bg-white rounded-2xl transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] p-2
        ${(showSuggestions && suggestions.length > 0) || activeMenu !== 'none'
          ? 'rounded-b-none shadow-2xl shadow-indigo-900/10 border-slate-200 ring-1 ring-slate-100' 
          : 'shadow-xl shadow-slate-200/60 border-slate-200 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-0.5 border'
        }
      `}>
        
        {/* Category Selector (Left) */}
        <div className="relative shrink-0">
          <button
            onClick={() => toggleMenu('category')}
            className={`
               h-12 px-4 rounded-xl flex items-center gap-2 text-sm font-semibold transition-all duration-200
               ${activeMenu === 'category' ? 'bg-slate-100 text-slate-900' : 'hover:bg-slate-50 text-slate-600'}
            `}
          >
            <AnimatedFilterIcon 
                className={`w-4 h-4 ${activeMenu === 'category' ? 'text-indigo-600' : 'text-slate-400'}`} 
                isOpen={activeMenu === 'category'} 
            />
            <span className="hidden sm:inline">{getCategoryLabel()}</span>
            <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${activeMenu === 'category' ? 'rotate-180' : ''}`} />
          </button>

          {/* Category Dropdown (Multi-select) */}
          {activeMenu === 'category' && (
            <div className="absolute top-full left-0 mt-4 w-64 bg-white rounded-xl shadow-xl border border-slate-100 p-2 z-50 animate-fade-in origin-top-left">
              <div className="text-[10px] font-bold text-slate-400 px-3 py-2 uppercase tracking-wider">Search Context</div>
              {Object.values(SearchCategory).map((cat) => {
                const isSelected = selectedCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`
                      w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-between group
                      ${isSelected 
                        ? 'bg-indigo-50 text-indigo-700' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }
                    `}
                  >
                    <span className="flex-1">{cat}</span>
                    {isSelected && <CheckIcon className="w-4 h-4 text-indigo-600" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Vertical Divider */}
        <div className="w-px h-8 bg-slate-200 mx-2 hidden sm:block"></div>

        {/* Main Input */}
        <div className="flex-1 relative flex items-center">
            <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                onFocus={() => {
                  onFocus();
                  setActiveMenu('none');
                }}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything..."
                className="w-full bg-transparent border-none focus:ring-0 text-slate-800 placeholder-slate-400 h-12 px-3 text-lg font-medium outline-none"
            />
             {query && (
              <button 
                onClick={() => {
                  onQueryChange('');
                  // Also clear suggestions/results if handled by parent, 
                  // but visually just clearing query here
                }}
                className="absolute right-2 p-1.5 text-slate-300 hover:text-slate-500 hover:bg-slate-100 rounded-full transition-all"
              >
                <XIcon className="w-4 h-4" />
              </button>
            )}
        </div>

        {/* Language & Action (Right) */}
        <div className="relative shrink-0 flex items-center gap-2">
            
            {/* Language Trigger */}
            <div className="relative">
                <button
                    onClick={() => toggleMenu('language')}
                    className={`
                        h-10 px-2 sm:px-3 rounded-lg flex items-center gap-2 transition-all text-xs font-bold uppercase tracking-wide
                         ${activeMenu === 'language' ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-50 text-slate-500 hover:text-slate-700'}
                    `}
                >
                    <div className="w-5 h-5 rounded-full overflow-hidden shadow-sm border border-slate-100 flex-shrink-0">
                       <img 
                            src={getLanguageFlag(selectedLanguage)} 
                            alt={selectedLanguage}
                            className="w-full h-full object-cover"
                       />
                    </div>
                    <span className="hidden sm:inline">{selectedLanguage}</span>
                </button>
                
                 {/* Language Dropdown */}
                {activeMenu === 'language' && (
                    <div className="absolute top-full right-0 mt-4 w-48 bg-white rounded-xl shadow-xl border border-slate-100 p-2 z-50 animate-fade-in origin-top-right">
                    <div className="text-[10px] font-bold text-slate-400 px-3 py-2 uppercase tracking-wider">Language</div>
                    {Object.values(SearchLanguage).map((lang) => (
                        <button
                        key={lang}
                        onClick={() => {
                            onLanguageChange(lang);
                            setActiveMenu('none');
                            inputRef.current?.focus();
                        }}
                        className={`
                            w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold uppercase transition-all flex items-center justify-between
                            ${selectedLanguage === lang 
                            ? 'bg-indigo-50 text-indigo-700' 
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            }
                        `}
                        >
                        <div className="flex items-center gap-3">
                             <div className="w-5 h-5 rounded-full overflow-hidden shadow-sm border border-slate-200 flex-shrink-0">
                                <img 
                                    src={getLanguageFlag(lang)} 
                                    alt={lang}
                                    className="w-full h-full object-cover"
                                />
                             </div>
                            <span>{getLanguageLabel(lang)}</span>
                        </div>
                        {selectedLanguage === lang && <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />}
                        </button>
                    ))}
                    </div>
                )}
            </div>

            {/* Search Button */}
            <button
                onClick={() => {
                  onSearch(query);
                  setActiveMenu('none');
                }}
                disabled={!query.trim() || isSearching}
                className={`
                    h-12 w-12 rounded-xl transition-all duration-300 ease-out flex items-center justify-center shadow-lg
                    ${query.trim() 
                      ? 'bg-slate-900 text-white shadow-indigo-500/20 hover:bg-indigo-600 hover:scale-105 active:scale-95' 
                      : 'bg-slate-100 text-slate-300 shadow-none'
                    }
                `}
            >
                {isSearching ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    <ArrowRightIcon className="w-5 h-5" />
                )}
            </button>
        </div>
        
      </div>

      {/* Auto-complete Dropdown (Below the unified bar) */}
      {showSuggestions && suggestions.length > 0 && activeMenu === 'none' && (
           <div 
             className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl shadow-indigo-900/10 border border-slate-100 overflow-hidden z-20 animate-fade-in origin-top"
           >
             <div className="py-2">
                {suggestions.map((suggestion, idx) => (
                <button
                    key={idx}
                    onClick={() => {
                        onSearch(suggestion);
                        setShowSuggestions(false);
                    }}
                    className="w-full text-left px-6 py-3.5 hover:bg-slate-50 flex items-center gap-4 text-slate-600 group transition-colors"
                >
                    <SearchIcon className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                    <span className="flex-1 font-medium">{suggestion}</span>
                    <ArrowRightIcon className="w-4 h-4 text-transparent group-hover:text-slate-400 -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
                </button>
                ))}
             </div>
           </div>
        )}
    </div>
  );
};