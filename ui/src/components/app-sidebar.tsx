"use client"

import * as React from "react"
import {
  Compass,
  GraduationCap,
  BookmarkIcon,
  CreditCard,
  ChevronRight,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { FilterTree } from "@/components/FilterTree"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Compass className="size-5" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold text-base">VerbaLingo</span>
                  <span className="text-sm">v1.0.0</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm">Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={true} tooltip="Discover" className="h-10 text-base">
                  <Compass className="size-5" />
                  <span>Discover</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <Collapsible asChild defaultOpen={true} className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip="Study Hub" className="h-10 text-base">
                      <GraduationCap className="size-5" />
                      <span>Study Hub</span>
                      <ChevronRight className="ml-auto size-5 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild className="opacity-70 cursor-not-allowed h-9 text-sm">
                          <span className="flex items-center gap-2 w-full">
                            <BookmarkIcon className="size-4" />
                            <span>Saved Words</span>
                            <Badge variant="secondary" className="ml-auto text-[10px] h-5 px-1.5">Soon</Badge>
                          </span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild className="opacity-70 cursor-not-allowed h-9 text-sm">
                          <span className="flex items-center gap-2 w-full">
                            <CreditCard className="size-4" />
                            <span>Flash Card</span>
                            <Badge variant="secondary" className="ml-auto text-[10px] h-5 px-1.5">Soon</Badge>
                          </span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="flex-1 overflow-hidden">
          <SidebarGroupLabel className="text-sm">Filters</SidebarGroupLabel>
          <SidebarGroupContent className="h-full">
            <div className="px-2 h-full">
              <FilterTree />
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
