import type { AdminUser, AuthSession } from '../types/auth';

const SESSION_STORAGE_KEY = 'game_admin_auth_session_v1';

export class SessionService {
  /**
   * Persists the authenticated session token and sanitized user profile.
   * Uses localStorage if rememberMe is enabled, otherwise sessionStorage.
   */
  public setSession(token: string, user: AdminUser, rememberMe: boolean = false): void {
    // 8 hours for standard session, 7 days for remember me
    const durationMs = rememberMe ? 7 * 24 * 60 * 60 * 1000 : 8 * 60 * 60 * 1000;
    const expiresAt = Date.now() + durationMs;

    const session: AuthSession = {
      token,
      user,
      expiresAt,
      rememberMe,
    };

    const serialized = JSON.stringify(session);

    // Clean up any opposite storage target
    try {
      if (rememberMe) {
        localStorage.setItem(SESSION_STORAGE_KEY, serialized);
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
      } else {
        sessionStorage.setItem(SESSION_STORAGE_KEY, serialized);
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    } catch (err) {
      console.warn('Failed to persist session to web storage:', err);
    }
  }

  /**
   * Retrieves the current session if valid and not expired.
   */
  public getSession(): AuthSession | null {
    try {
      // Check sessionStorage first, then fallback to localStorage
      let raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (!raw) {
        raw = localStorage.getItem(SESSION_STORAGE_KEY);
      }

      if (!raw) return null;

      const session: AuthSession = JSON.parse(raw);

      // Verify expiration
      if (!session || !session.expiresAt || Date.now() > session.expiresAt) {
        this.clearSession();
        return null;
      }

      return session;
    } catch {
      this.clearSession();
      return null;
    }
  }

  /**
   * Verifies if a valid, unexpired session exists.
   */
  public isSessionValid(): boolean {
    const session = this.getSession();
    return Boolean(session && session.token && session.user && session.expiresAt > Date.now());
  }

  /**
   * Clears session from both localStorage and sessionStorage.
   */
  public clearSession(): void {
    try {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (err) {
      console.warn('Failed to clear session:', err);
    }
  }
}

export const sessionService = new SessionService();
