"use client";

import { Moon, Sun } from "lucide-react";

import { useTheme } from "@/components/shared/theme-provider";
import {
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Switch } from "@/components/ui/switch";

export const ThemeToggle = () => {
  const { state } = useSidebar();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  if (state === "collapsed") {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <button
            type="button"
            onClick={toggleTheme}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ring-sidebar-ring flex h-8 w-full items-center justify-center rounded-md outline-none transition-colors focus-visible:ring-2"
          >
            {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="ring-sidebar-ring text-sidebar-foreground flex h-8 items-center justify-between rounded-md px-2 text-sm focus-within:ring-2">
          <div className="flex items-center gap-2">
            {isDark ? <Moon className="size-4" /> : <Sun className="size-4" />}
            <span>Dark mode</span>
          </div>
          <Switch
            checked={isDark}
            onCheckedChange={toggleTheme}
            aria-label="Toggle dark mode"
          />
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};
