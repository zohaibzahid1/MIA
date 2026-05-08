import { SetMetadata } from '@nestjs/common';

// Enum for roles to ensure type safety
export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  EMPLOYEE = 'employee',
  HR = 'hr'
}

// Decorator to specify required roles
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

// Convenience decorators for common role combinations
export const AdminOnly = () => Roles(UserRole.ADMIN);
export const ManagerOnly = () => Roles(UserRole.MANAGER);
export const EmployeeOnly = () => Roles(UserRole.EMPLOYEE);
export const HROnly = () => Roles(UserRole.HR);

// Combined role decorators
export const AdminOrHR = () => Roles(UserRole.ADMIN, UserRole.HR);
export const ManagerOrAdmin = () => Roles(UserRole.MANAGER, UserRole.ADMIN);
export const ManagerOrHR = () => Roles(UserRole.MANAGER, UserRole.HR);
export const AdminOrManagerOrHR = () => Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.HR);

