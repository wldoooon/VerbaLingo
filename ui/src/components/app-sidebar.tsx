"use client"

import * as React from "react"
import {
  BookOpen,
  Bot,
  Command,
  GalleryVerticalEnd,
  Heart,
  Play,
  Settings2,
  TrendingUp,
  Users,
  Video,
  Trophy,
  Search,
  Star,
  BarChart3,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  user: {
    name: "wldooon",
    email: "user@verbalingo.com",
    avatar: "/avatars/user.jpg",
  },
  teams: [
    {
      name: "VerbaLingo",
      logo: GalleryVerticalEnd,
      plan: "Premium",
    },
    {
      name: "English Learning",
      logo: Command,
      plan: "Pro",
    },
  ],
  navMain: [
    {
      title: "Learn",
      url: "/learn",
      icon: BookOpen,
      isActive: true,
      items: [
        {
          title: "Lessons",
          url: "/learn/lessons",
        },
        {
          title: "Grammar",
          url: "/learn/grammar",
        },
        {
          title: "Vocabulary",
          url: "/learn/vocabulary",
        },
        {
          title: "Pronunciation",
          url: "/learn/pronunciation",
        },
      ],
    },
    {
      title: "Videos",
      url: "/videos",
      icon: Video,
      items: [
        {
          title: "Discover",
          url: "/videos/discover",
        },
        {
          title: "Collections",
          url: "/videos/collections",
        },
        {
          title: "Channels",
          url: "/videos/channels",
        },
        {
          title: "Trending",
          url: "/videos/trending",
        },
      ],
    },
    {
      title: "Progress",
      url: "/progress",
      icon: TrendingUp,
      items: [
        {
          title: "Overview",
          url: "/progress/overview",
        },
        {
          title: "Statistics",
          url: "/progress/stats",
        },
        {
          title: "Achievements",
          url: "/progress/achievements",
        },
        {
          title: "Streaks",
          url: "/progress/streaks",
        },
      ],
    },
    {
      title: "Community",
      url: "/community",
      icon: Users,
      items: [
        {
          title: "Forums",
          url: "/community/forums",
        },
        {
          title: "Study Groups",
          url: "/community/groups",
        },
        {
          title: "Leaderboard",
          url: "/community/leaderboard",
        },
        {
          title: "Events",
          url: "/community/events",
        },
      ],
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings2,
      items: [
        {
          title: "Profile",
          url: "/settings/profile",
        },
        {
          title: "Preferences",
          url: "/settings/preferences",
        },
        {
          title: "Notifications",
          url: "/settings/notifications",
        },
        {
          title: "Privacy",
          url: "/settings/privacy",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Favorites",
      url: "/favorites",
      icon: Heart,
    },
    {
      name: "Search",
      url: "/search",
      icon: Search,
    },
    {
      name: "AI Assistant",
      url: "/ai",
      icon: Bot,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
