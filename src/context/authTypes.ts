import { createContext } from 'react';
import type { UserRole } from '../mocks/users';

export interface AuthSession {
  id: number;
  username: string;
  name: string;
  role: UserRole;
}

export interface AuthContextType {
  session: AuthSession | null;
  activeSessions: AuthSession[];
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  switchSession: (userId: number) => void;
  removeSession: (userId: number) => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);
