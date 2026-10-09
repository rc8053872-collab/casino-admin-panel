import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { AdminRole, Permission } from '../../types/auth';

interface PermissionGuardProps {
  permission?: Permission;
  role?: AdminRole | AdminRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirect?: boolean;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  role,
  children,
  fallback,
  redirect = false,
}) => {
  const { hasPermission, hasRole } = useAuth();

  let isAllowed = true;

  if (permission && !hasPermission(permission)) {
    isAllowed = false;
  }

  if (role && !hasRole(role)) {
    isAllowed = false;
  }

  if (!isAllowed) {
    if (redirect) {
      return <Navigate to="/admin/403" replace />;
    }

    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="p-6 bg-white border border-rose-200 rounded-2xl shadow-2xs text-center space-y-2">
        <h3 className="text-sm font-bold text-rose-700">Access Restricted</h3>
        <p className="text-xs text-slate-500">
          Your administrative role does not have authorization to view this operational module.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};

export default PermissionGuard;
