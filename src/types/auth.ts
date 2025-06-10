// src/types/auth.ts
export type UserRole = 'client' | 'admin' | 'employee';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
  createdAt: Date;
}

export interface AuthenticatedUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
  createdAt: Date;
}

export interface AuthContextType {
  currentUser: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string, expectedRole?: UserRole) => Promise<{ success: boolean; }>;
  register: (email: string, password: string, displayName: string, role?: UserRole) => Promise<{ success: boolean; }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  refreshUser: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  hasMinimumRole: (minimumRole: UserRole) => boolean;
}