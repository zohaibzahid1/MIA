import { LucideIcon } from "lucide-react";
import {
  SquareTerminal,
  ClipboardList,
  Users,
  UserCheck,
  FileText,
  BarChart3,
  Building2,
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
  employeeItems: Omit<NavigationItem, 'isActive'>[];
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
  // employee-specific items
  employeeItems: [
    {
      title: "Evaluations",
      url: "/dashboard/evaluations",
      icon: ClipboardList,
      items: [
        {
          title: "Submit Current Reviews",
          url: "/dashboard/submit-evaluations",
        },
      ],
    }
  ],

});

export const buildNavigationItems = (
  config: NavigationConfig,
  userRole: UserRole
): NavigationItem[] => {
  const { baseItems, employeeItems } = config;

  // Add isActive property to items based on current pathname
  const addActiveState = (items: Omit<NavigationItem, 'isActive'>[]): NavigationItem[] => {
    return items.map(item => ({
      ...item,
      isActive: false, // Will be determined by current route in component
    }));
  };

  // Build navigation based on role
  let navigationItems: NavigationItem[] = addActiveState(baseItems);

  // Add role-specific items
  if (userRole === UserRole.EMPLOYEE) {
    navigationItems = [...navigationItems, ...addActiveState(employeeItems)];
  }

  return navigationItems;
};
