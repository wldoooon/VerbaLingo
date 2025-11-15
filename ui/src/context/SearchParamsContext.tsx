'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

type SearchParamsContextType = {
  query: string
  category: string | null
  language: string
  setQuery: (query: string) => void
  setCategory: (category: string | null) => void
  setLanguage: (language: string) => void
}

const SearchParamsContext = createContext<SearchParamsContextType>({
  query: '',
  category: null,
  language: 'English',
  setQuery: () => {},
  setCategory: () => {},
  setLanguage: () => {},
})

export const SearchParamsProvider = ({ children }: { children: ReactNode }) => {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string | null>(null)
  const [language, setLanguage] = useState<string>('English')

  return (
    <SearchParamsContext.Provider value={{ query, category, language, setQuery, setCategory, setLanguage }}>
      {children}
    </SearchParamsContext.Provider>
  )
}

export const useSearchParams = () => useContext(SearchParamsContext)
