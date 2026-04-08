import {
  createContext,
  ReactNode,
  useEffect,
  useMemo,
  useState
} from 'react';
import { api } from '../api/axios';
import { User } from '../types';

interface LoginPayload {
  email: string;
  password: string;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('auth_token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.get<{ user: User }>('/auth/me');
        const payload = response.data.user;
        setUser({
          id: payload._id || payload.id,
          fullName: payload.fullName,
          email: payload.email,
          role: payload.role
        });
      } catch {
        localStorage.removeItem('auth_token');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    void bootstrap();
  }, [token]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      isLoading,
      login: async (payload) => {
        const response = await api.post<{ token: string; user: User }>('/auth/login', payload);
        localStorage.setItem('auth_token', response.data.token);
        setToken(response.data.token);
        setUser(response.data.user);
      },
      logout: () => {
        localStorage.removeItem('auth_token');
        setToken(null);
        setUser(null);
      }
    }),
    [isLoading, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
