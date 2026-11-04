import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { TOKEN_KEY } from '../api/client';
import { authApi } from '../api/services';

const AuthContext = createContext(null);
const USER_KEY = 'lg_user';

function lireUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(lireUser);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  const login = useCallback(async (email, password) => {
    const { token, user: u } = await authApi.login(email, password);
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    setUser(u);
    return u;
  }, []);

  const register = useCallback(async (nom, email, password) => {
    await authApi.register(nom, email, password);
    return login(email, password);
  }, [login]);

  // Déconnexion automatique quand l'API répond 401 (jeton expiré)
  useEffect(() => {
    const handler = () => logout();
    window.addEventListener('lg:session-expiree', handler);
    return () => window.removeEventListener('lg:session-expiree', handler);
  }, [logout]);

  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    isClient: user?.role === 'client',
    hasRole: (...roles) => !!user && roles.includes(user.role),
    login,
    register,
    logout,
  }), [user, login, register, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
