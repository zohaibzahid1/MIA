import { BadgeVariant } from "@/types/userManagementTypes";

// Maps role -> badge variant (for table chips)
export const getRoleBadgeVariant = (role: string): BadgeVariant => {
  const map: Record<string, BadgeVariant> = {
    "super admin": "destructive",
    admin: "destructive",
    hr: "default",
    manager: "default",
    employee: "secondary",
    intern: "outline",
  };
  return map[role?.toLowerCase()] ?? "outline";
};

// Maps mode -> badge variant
export const getModeBadgeVariant = (mode: string): BadgeVariant => {
  const map: Record<string, BadgeVariant> = {
    active: "default",
    inactive: "secondary",
    pending: "outline",
  };
  return map[mode?.toLowerCase()] ?? "outline";
};

export const getRoleLabel = (val: string) => {
  const ALLOWED_ROLES = [
    { value: "employee", label: "Employee" },
    { value: "hr", label: "HR" },
    { value: "manager", label: "Manager" },
    { value: "super admin", label: "Super Admin" },
  ];
  const r = ALLOWED_ROLES.find((x) => x.value.toLowerCase() === val?.toLowerCase());
  return r ? r.label : val;
};
