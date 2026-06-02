import { createContext } from 'react';

export type UserRole = 'administrador' | 'vendedor';

export interface AuthSession {
  id: number;
  username: string;
  name: string;
  role: UserRole;
  token: string;
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
