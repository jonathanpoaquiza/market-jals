// src/types/auth.ts
export type UserRole = 'client' | 'admin' | 'employee';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
  createdAt: Date;
}

// Si tienes un tipo AuthenticatedUser separado, asegúrate de que incluya displayName
export interface AuthenticatedUser {
  uid: string;
  email: string | null;
  displayName: string | null; // Esta línea debe existir
  role: UserRole;
  createdAt: Date;
}

export interface AuthContextType {
  currentUser: UserProfile | null; // O AuthenticatedUser | null si prefieres
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}