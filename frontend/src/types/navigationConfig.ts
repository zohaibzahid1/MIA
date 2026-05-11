import { LucideIcon } from "lucide-react";
import {
  SquareTerminal,
  Stethoscope,
} from "lucide-react";
import { UserRole } from '@/stores/userStore';

export interface NavigationSubItem {
  title: string;
  url: string;
}

export interface NavigationItem {
  title: string;
  url: string;
  icon: LucideIcon;
  isActive: boolean;
  items: NavigationSubItem[];
}

export interface NavigationConfig {
  baseItems: Omit<NavigationItem, 'isActive'>[];
}

export const getNavigationConfig = (): NavigationConfig => ({
  // include base items that are common for all users
  baseItems: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: SquareTerminal,
      items: [
        {
          title: "Overview",
          url: "/dashboard",
        },
      ],
    },
    {
      title: "Patients",
      url: "/dashboard/patients",
      icon: Stethoscope,
      items: [
        {
          title: "All Patients",
          url: "/dashboard/patients",
        },
        {
          title: "Add Patient",
          url: "/dashboard/patients/add",
        },
      ],
    },
  ],
});

export const buildNavigationItems = (
  config: NavigationConfig,
  userRole: UserRole
): NavigationItem[] => {
  const { baseItems } = config;

  // Add isActive property to items based on current pathname
  const addActiveState = (items: Omit<NavigationItem, 'isActive'>[]): NavigationItem[] => {
    return items.map(item => ({
      ...item,
      isActive: false, // Will be determined by current route in component
    }));
  };

  // Build navigation items
  const navigationItems: NavigationItem[] = addActiveState(baseItems);

  return navigationItems;
};
