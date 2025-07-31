"use client"

import { QueryClientProvider } from "@tanstack/react-query"
import { queryClient } from "@/lib/queryClient"

interface Props {
    children: React.ReactNode
}

export default function QueryProvider({children} : Props) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}