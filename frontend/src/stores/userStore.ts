
import { autorun, makeAutoObservable } from "mobx";

export enum UserRole {
  EMPLOYEE = 'employee',
  MANAGER = 'manager',
  HR = 'hr',
  ADMIN = 'admin'
}

export interface User {
  id: number;
  googleId: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
}

export interface UserInput {
  id: number | string;
  googleId: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
}

export class UserStore {
  user: User | null = null;
  isLoading = false;
  error: string | null = null;

  constructor() {
    console.log("UserStore initialized");
    this.isLoading = false;
    this.error = null;

    makeAutoObservable(this);
    autorun(() => {
      console.log('UserStore state changed:', this.user);
    });
  }

  setUser(userInput: UserInput) {
    const numericId = typeof userInput.id === 'string'
      ? parseInt(userInput.id, 10)
      : userInput.id;

    const processedUser: User = {
      id: numericId,
      googleId: userInput.googleId,
      name: userInput.name,
      email: userInput.email,
      avatar: userInput.avatar,
      role: userInput.role,
    };

    this.user = processedUser;
    console.log("User set in UserStore:", this.user);
  }


  /*
  updateSelfEvaluationTemplate(templateId: number | null) {
    // Legacy method - functionality removed
  }
  updateSupervisorEvaluationTemplate(templateId: number | null) {
    // Legacy method - functionality removed
  }
  */

  //clear user data on logout
  clearUser() {
    this.user = null;
  }
  // --- IGNORE ---

  get userRole(): UserRole | null {
    return this.user?.role || null;
  }

  hasRole(role: UserRole): boolean {
    return this.user?.role === role;
  }


  get isEmployee() { return this.hasRole(UserRole.EMPLOYEE); }
  get isManager() { return this.hasRole(UserRole.MANAGER); }
  get isHR() { return this.hasRole(UserRole.HR); }
  get isAdmin() { return this.hasRole(UserRole.ADMIN); }


  get managerId(): number | null {
    // return this.user?.reportingTo?.id || null;
    return null; // Manager relationship removed
  }

  get userId(): number | null {
    return this.user?.id || null;
  }
}

export default UserStore;
