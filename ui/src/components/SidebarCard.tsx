"use client"

import { FilterTree } from "@/components/FilterTree"

export function SidebarCard() {
  return (
    <aside className="hidden lg:block w-[260px] border-r bg-card sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="p-4 h-full">
        <FilterTree />
      </div>
    </aside>
  )
}
