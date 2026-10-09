export type AdminRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'MANAGER'
  | 'FINANCE'
  | 'SUPPORT';

export type AdminUserStatus = 'active' | 'inactive';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  username: string;
  avatar?: string;
  role: AdminRole;
  status: AdminUserStatus;
  lastLoginAt?: string;
}

export type Permission =
  | 'all'
  | 'players.read'
  | 'players.write'
  | 'players.block'
  | 'games.read'
  | 'games.write'
  | 'games.operate'
  | 'transactions.read'
  | 'transactions.approve'
  | 'financial.read'
  | 'reports.read'
  | 'settings.read'
  | 'settings.write';

export const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  SUPER_ADMIN: ['all'],
  ADMIN: [
    'players.read',
    'players.write',
    'players.block',
    'games.read',
    'games.write',
    'games.operate',
    'transactions.read',
    'reports.read',
    'settings.read',
  ],
  FINANCE: [
    'transactions.read',
    'transactions.approve',
    'financial.read',
    'reports.read',
  ],
  MANAGER: [
    'players.read',
    'games.read',
    'games.operate',
    'transactions.read',
    'reports.read',
  ],
  SUPPORT: [
    'players.read',
    'players.block',
    'games.read',
    'transactions.read',
  ],
};

export interface AuthSession {
  token: string;
  user: AdminUser;
  expiresAt: number;
  rememberMe: boolean;
}

export interface LoginCredentials {
  emailOrUsername: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  success: boolean;
  user?: AdminUser;
  token?: string;
  message?: string;
}
