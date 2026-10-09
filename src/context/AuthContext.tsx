import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock } from 'lucide-react';
import type {
  AdminRole,
  AdminUser,
  AuthResponse,
  LoginCredentials,
  Permission,
} from '../types/auth';
import { ROLE_PERMISSIONS } from '../types/auth';
import { authService } from '../services/authService';
import { sessionService } from '../services/sessionService';

interface AuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSessionExpired: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  expireSession: () => void;
  hasRole: (roles: AdminRole | AdminRole[]) => boolean;
  hasPermission: (permission: Permission) => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSessionExpired, setIsSessionExpired] = useState<boolean>(false);

  // Initialize and verify session on initial mount
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const verifiedUser = await authService.verifySession();
        if (isMounted) {
          setUser(verifiedUser);
        }
      } catch (err) {
        console.warn('Authentication verification check failed:', err);
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const expireSession = useCallback(() => {
    sessionService.clearSession();
    setUser(null);
    setIsSessionExpired(true);
    queryClient.clear();
  }, [queryClient]);

  // Periodic session expiration checker (every 30 seconds)
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      if (!sessionService.isSessionValid()) {
        expireSession();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [user, expireSession]);

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<AuthResponse> => {
      setIsSessionExpired(false);
      const res = await authService.login(credentials);
      if (res.success && res.user) {
        setUser(res.user);
        // Refresh and invalidate any queries to fetch fresh admin data
        queryClient.invalidateQueries();
      }
      return res;
    },
    [queryClient]
  );

  const logout = useCallback(async (): Promise<void> => {
    setIsSessionExpired(false);
    await authService.logout();
    setUser(null);
    // Clear query cache so another administrator does not see stale cached data
    queryClient.clear();
  }, [queryClient]);

  const hasRole = useCallback(
    (roles: AdminRole | AdminRole[]): boolean => {
      if (!user) return false;
      const roleList = Array.isArray(roles) ? roles : [roles];
      return roleList.includes(user.role);
    },
    [user]
  );

  const hasPermission = useCallback(
    (permission: Permission): boolean => {
      if (!user) return false;
      if (user.role === 'SUPER_ADMIN') return true;

      const userPermissions = ROLE_PERMISSIONS[user.role] || [];
      if (userPermissions.includes('all')) return true;

      return userPermissions.includes(permission);
    },
    [user]
  );

  const refreshUser = useCallback(async (): Promise<void> => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, []);

  const handleSessionExpiredSignIn = () => {
    setIsSessionExpired(false);
    window.location.href = '/admin/login';
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      isSessionExpired,
      login,
      logout,
      expireSession,
      hasRole,
      hasPermission,
      refreshUser,
    }),
    [user, isLoading, isSessionExpired, login, logout, expireSession, hasRole, hasPermission, refreshUser]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}

      {/* Accessible Session Expired Dialog */}
      <AnimatePresence>
        {isSessionExpired && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-sm bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xl space-y-4"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="session-expired-title"
              aria-describedby="session-expired-desc"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/80 flex items-center justify-center shadow-xs">
                <Clock className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <h3 id="session-expired-title" className="text-base font-bold text-slate-900 tracking-tight">
                  Session expired
                </h3>
                <p id="session-expired-desc" className="text-xs text-slate-500 leading-relaxed">
                  Please sign in again to continue.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSessionExpiredSignIn}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  Sign In
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;

