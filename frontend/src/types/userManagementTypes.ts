export type NewUserData = {
  name: string;
  email: string;
  role: string;
  employeeCode: string;
  EmployeeMode: string;
};

export type BadgeVariant = "default" | "destructive" | "outline" | "secondary";

export interface EditableRowProps {
  user: any;
  index: number;
}

export const ALLOWED_ROLES = [
  { value: "employee", label: "Employee" },
  { value: "hr", label: "HR" },
  { value: "manager", label: "Manager" },
  { value: "super admin", label: "Super Admin" },
];
