"use client"

import * as React from "react"
import { observer } from 'mobx-react-lite';
import { useStore } from '@/context/storeContext';

import { getNavigationConfig, buildNavigationItems } from '@/types/navigationConfig';
import {
  GalleryVerticalEnd,
} from "lucide-react"

import { NavMain } from "@/components/sidebarUi/nav-main"
import { NavUser } from "@/components/sidebarUi/nav-user"
import { ThemeToggle } from "@/components/sidebarUi/theme-toggle"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"

const AppSidebarComponent = () => {
  const { userStore } = useStore();

  if (!userStore.user) {
    return null;
  }

  // Get navigation items based on user role
  const getNavigationData = () => {
    const config = getNavigationConfig();
    return buildNavigationItems(config, userStore.user!.role);
  };

  const data = {
    user: {
      name: userStore.user?.name || "User",
      email: userStore.user?.email || "user@example.com",
      role: userStore.user?.role || "employee",
      avatar: userStore.user.avatar || "/avatars/default.jpg",
    },
    teams: [
      {
        name: "Medical Image Analysis",
        logo: GalleryVerticalEnd,
        plan: userStore.user?.role.replace('_', ' ').toLowerCase() || "employee",
      },
    ],
    navMain: getNavigationData(), // will return what to display in the sidebar based on user role defined in navigationConfig.ts

  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>

      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />

      </SidebarContent>
      <SidebarFooter>
        <ThemeToggle />
        <SidebarSeparator />
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

export const AppSidebar = observer(AppSidebarComponent);
