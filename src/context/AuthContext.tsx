import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { findUser } from '../mocks/users';
import type { MockUser } from '../mocks/users';
import { AuthContext } from './authTypes';
import type { AuthSession } from './authTypes';

function serializeSession(user: MockUser): AuthSession {
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
  };
}

const SESSION_KEY = 'mslf_session';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (session) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }, [session]);

  const login = async (username: string, password: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const user = findUser(username.trim(), password);
    if (user) {
      setSession(serializeSession(user));
      return true;
    }
    return false;
  };

  const logout = () => {
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        isAuthenticated: session !== null,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
