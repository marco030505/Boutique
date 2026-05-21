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
const ACTIVE_SESSIONS_KEY = 'mslf_active_sessions';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [activeSessions, setActiveSessions] = useState<AuthSession[]>(() => {
    try {
      const stored = localStorage.getItem(ACTIVE_SESSIONS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (session) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }, [session]);

  useEffect(() => {
    localStorage.setItem(ACTIVE_SESSIONS_KEY, JSON.stringify(activeSessions));
  }, [activeSessions]);

  const login = async (username: string, password: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const user = findUser(username.trim(), password);
    if (user) {
      const newSession = serializeSession(user);
      setSession(newSession);
      setActiveSessions((prev) => {
        if (prev.some((s) => s.id === newSession.id)) {
          return prev.map((s) => s.id === newSession.id ? newSession : s);
        }
        return [...prev, newSession];
      });
      return true;
    }
    return false;
  };

  const switchSession = (userId: number) => {
    const target = activeSessions.find((s) => s.id === userId);
    if (target) {
      setSession(target);
    }
  };

  const removeSession = (userId: number) => {
    setActiveSessions((prev) => {
      const updated = prev.filter((s) => s.id !== userId);
      // If we removed the currently active session
      if (session?.id === userId) {
        if (updated.length > 0) {
          setSession(updated[0]);
        } else {
          setSession(null);
        }
      }
      return updated;
    });
  };

  const logout = () => {
    if (session) {
      removeSession(session.id);
    } else {
      setSession(null);
      setActiveSessions([]);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        activeSessions,
        isAuthenticated: session !== null,
        login,
        logout,
        switchSession,
        removeSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
