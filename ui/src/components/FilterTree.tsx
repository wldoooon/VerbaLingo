"use client"

import React, { useState } from "react"
import {
  checkboxesFeature,
  expandAllFeature,
  hotkeysCoreFeature,
  searchFeature,
  selectionFeature,
  syncDataLoaderFeature,
  TreeState,
} from "@headless-tree/core"
import { useTree } from "@headless-tree/react"
import { FolderIcon, FolderOpenIcon, SearchIcon } from "lucide-react"

import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Tree, TreeItem, TreeItemLabel } from "@/components/tree"

interface CategoryItem {
  name: string
  count?: number
  children?: string[]
}

// VerbaLingo video categories and channels
const categories: Record<string, CategoryItem> = {
  root: {
    name: "Filters",
    children: ["content-type", "channels", "difficulty", "duration"],
  },
  "content-type": {
    name: "Content Type",
    children: ["movies", "podcasts", "games", "tv-shows"],
  },
  movies: { name: "Movies & Cinema", count: 240 },
  podcasts: { name: "Podcasts", count: 180 },
  games: { name: "Gaming", count: 156 },
  "tv-shows": { name: "TV Shows", count: 320 },
  
  channels: {
    name: "Popular Channels",
    children: ["lex-fridman", "joe-rogan", "ted-talks", "netflix"],
  },
  "lex-fridman": { name: "Lex Fridman", count: 450 },
  "joe-rogan": { name: "Joe Rogan Experience", count: 620 },
  "ted-talks": { name: "TED Talks", count: 890 },
  netflix: { name: "Netflix", count: 1200 },
  
  difficulty: {
    name: "Difficulty Level",
    children: ["beginner", "intermediate", "advanced"],
  },
  beginner: { name: "Beginner", count: 450 },
  intermediate: { name: "Intermediate", count: 680 },
  advanced: { name: "Advanced", count: 320 },
  
  duration: {
    name: "Video Duration",
    children: ["short", "medium", "long"],
  },
  short: { name: "< 5 minutes", count: 234 },
  medium: { name: "5-20 minutes", count: 567 },
  long: { name: "> 20 minutes", count: 890 },
}

const indent = 16

export function FilterTree() {
  const initialExpandedItems = ["content-type", "channels"]
  const [state, setState] = useState<Partial<TreeState<CategoryItem>>>({})

  const tree = useTree<CategoryItem>({
    state,
    setState,
    initialState: {
      expandedItems: initialExpandedItems,
      checkedItems: [], // Empty by default, user selects filters
    },
    indent,
    rootItemId: "root",
    getItemName: (item) => item.getItemData().name,
    isItemFolder: (item) => (item.getItemData()?.children?.length ?? 0) > 0,
    dataLoader: {
      getItem: (itemId) => categories[itemId],
      getChildren: (itemId) => categories[itemId].children ?? [],
    },
    canCheckFolders: true, // Allow checking folder items
    features: [
      syncDataLoaderFeature,
      hotkeysCoreFeature,
      selectionFeature,
      searchFeature,
      expandAllFeature,
      checkboxesFeature, // Enable checkboxes
    ],
  })

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Search Input */}
      <div className="relative">
        <Input
          className="peer ps-9 h-9 rounded-xl"
          {...{
            ...tree.getSearchInputElementProps(),
            onChange: (e) => {
              const originalProps = tree.getSearchInputElementProps()
              if (originalProps.onChange) {
                originalProps.onChange(e)
              }

              const value = e.target.value
              if (value.length > 0) {
                tree.expandAll()
              } else {
                setState((prevState) => ({
                  ...prevState,
                  expandedItems: initialExpandedItems,
                }))
              }
            },
          }}
          type="search"
          placeholder="Search filters..."
        />
        <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
          <SearchIcon className="size-4" aria-hidden="true" />
        </div>
      </div>

      {/* Tree Component */}
      <div className="flex-1 overflow-y-auto">
        <Tree indent={indent} tree={tree}>
          {tree.getItems().map((item) => {
            const itemData = item.getItemData()
            return (
              <div
                key={item.getId()}
                className="flex items-center gap-2 not-last:pb-0.5"
              >
                {/* Checkbox */}
                <Checkbox
                  checked={
                    {
                      checked: true,
                      unchecked: false,
                      indeterminate: "indeterminate" as const,
                    }[item.getCheckedState()]
                  }
                  onCheckedChange={(checked) => {
                    const checkboxProps = item.getCheckboxProps()
                    checkboxProps.onChange?.({ target: { checked } })
                  }}
                />

                {/* Tree Item */}
                <TreeItem item={item} className="flex-1 not-last:pb-0">
                  <TreeItemLabel>
                    <span className="flex items-center justify-between gap-2 w-full">
                      <span className="flex items-center gap-2 flex-1 min-w-0">
                        {item.isFolder() &&
                          (item.isExpanded() ? (
                            <FolderOpenIcon className="pointer-events-none size-4 shrink-0 text-muted-foreground" />
                          ) : (
                            <FolderIcon className="pointer-events-none size-4 shrink-0 text-muted-foreground" />
                          ))}
                        <span className={`truncate ${item.isFolder() ? 'font-semibold' : ''}`}>
                          {item.getItemName()}
                        </span>
                      </span>
                      {itemData.count !== undefined && (
                        <span className="text-xs text-muted-foreground shrink-0">
                          {itemData.count}
                        </span>
                      )}
                    </span>
                  </TreeItemLabel>
                </TreeItem>
              </div>
            )
          })}
        </Tree>
      </div>
    </div>
  )
}
