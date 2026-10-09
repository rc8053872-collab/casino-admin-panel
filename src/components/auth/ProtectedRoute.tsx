import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield } from 'lucide-react';

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // 1. Loading State - Center Splash Screen without Dashboard Flicker
  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-[#F4F5F7] flex flex-col items-center justify-center p-4 select-none">
        <div className="flex flex-col items-center space-y-4 max-w-sm text-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md animate-pulse">
            <Shield className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Game Admin</h2>
            <p className="text-xs text-slate-500 font-medium">
              Loading administration console...
            </p>
          </div>

          <div className="w-36 h-1 bg-slate-200 rounded-full overflow-hidden">
            <div className="w-full h-full bg-blue-600 rounded-full animate-[progress_1s_ease-in-out_infinite]" />
          </div>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated - Redirect to /admin/login with original redirect path
  if (!isAuthenticated) {
    const redirectUrl = `${location.pathname}${location.search}`;
    const target =
      redirectUrl && redirectUrl !== '/admin' && redirectUrl !== '/admin/'
        ? `/admin/login?redirect=${encodeURIComponent(redirectUrl)}`
        : '/admin/login';

    return <Navigate to={target} replace />;
  }

  // 3. Authenticated - Render protected contents
  return <>{children}</>;
};

export default ProtectedRoute;
