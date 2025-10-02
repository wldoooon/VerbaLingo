'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

type SearchParamsContextType = {
  query: string
  category: string | null
  setQuery: (query: string) => void
  setCategory: (category: string | null) => void
}

const SearchParamsContext = createContext<SearchParamsContextType>({
  query: '',
  category: null,
  setQuery: () => {},
  setCategory: () => {},
})

export const SearchParamsProvider = ({ children }: { children: ReactNode }) => {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string | null>(null)

  return (
    <SearchParamsContext.Provider value={{ query, category, setQuery, setCategory }}>
      {children}
    </SearchParamsContext.Provider>
  )
}

export const useSearchParams = () => useContext(SearchParamsContext)
