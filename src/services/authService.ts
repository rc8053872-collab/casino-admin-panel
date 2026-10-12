import type { AdminUser, AuthResponse, AuthSession, LoginCredentials } from '../types/auth';
import { sessionService } from './sessionService';

const API_BASE = import.meta.env.VITE_GAME_API_URL || import.meta.env.VITE_API_URL || 'http://casino-baac-env.eba-9kvg9eap.ap-southeast-2.elasticbeanstalk.com/api';

interface BackendAuthResponse {
  status: string;
  message?: string;
  token?: string;
  user?: {
    id: string;
    email: string | null;
    phone: string | null;
    role: string;
  };
}

function toAdminUser(user: BackendAuthResponse['user']): AdminUser | null {
  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) return null;
  const email = user.email || '';
  const username = email.split('@')[0] || user.phone || 'admin';
  return {
    id: user.id,
    name: username,
    email,
    username,
    avatar: username.slice(0, 2).toUpperCase(),
    role: user.role,
    status: 'active',
    lastLoginAt: new Date().toISOString()
  };
}

async function request<T>(path: string, body?: unknown, token?: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) })
  });
  const result = await response.json().catch(() => ({})) as T & { message?: string };
  if (!response.ok) {
    throw new Error(result.message || `Authentication request failed (${response.status}).`);
  }
  return result;
}

export class AuthService {
  public async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await request<BackendAuthResponse>('/v1/auth/login', {
        identifier: credentials.emailOrUsername,
        password: credentials.password
      });
      const user = toAdminUser(response.user);
      if (!response.token || !user) {
        return { success: false, message: 'This account does not have administrator access.' };
      }
      sessionService.setSession(response.token, user, credentials.rememberMe ?? false);
      return { success: true, token: response.token, user };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Could not sign in. Please try again.'
      };
    }
  }

  public async logout(): Promise<void> {
    sessionService.clearSession();
  }

  public getCurrentUser(): AdminUser | null {
    return sessionService.getSession()?.user ?? null;
  }

  public getSession(): AuthSession | null {
    return sessionService.getSession();
  }

  public async verifySession(): Promise<AdminUser | null> {
    const session = sessionService.getSession();
    if (!session?.token) return null;

    const response = await request<BackendAuthResponse>('/v1/auth/me', undefined, session.token);
    const user = toAdminUser(response.user);
    if (!user) {
      sessionService.clearSession();
      return null;
    }
    sessionService.setSession(session.token, user, session.rememberMe);
    return user;
  }

  public async refreshSession(): Promise<AuthResponse> {
    const user = await this.verifySession();
    const session = sessionService.getSession();
    return user && session
      ? { success: true, token: session.token, user }
      : { success: false, message: 'No active admin session. Please sign in again.' };
  }

  public async changePassword(oldPass: string, newPass: string): Promise<boolean> {
    const session = sessionService.getSession();
    if (!session?.token) return false;
    try {
      await request('/v1/auth/change-password', { currentPassword: oldPass, newPassword: newPass }, session.token);
      return true;
    } catch {
      return false;
    }
  }
}

export const authService = new AuthService();
