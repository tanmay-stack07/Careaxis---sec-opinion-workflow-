export const DEMO_AUTH_STORAGE_KEY = "careaxis_demo_authed";
const ACCESS_TOKEN_STORAGE_KEY = "careaxis_access_token";
const AUTH_USER_STORAGE_KEY = "careaxis_auth_user";

export type AuthUser = {
  id: string;
  full_name: string;
};

export function setAuthSession(accessToken: string, user: AuthUser) {
  try {
    window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken);
    window.localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
    // Keep legacy flag for compatibility with old checks in stale tabs.
    window.localStorage.setItem(DEMO_AUTH_STORAGE_KEY, "1");
  } catch {
    // ignore
  }
}

export function getAuthToken(): string | null {
  try {
    return window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function getAuthUser(): AuthUser | null {
  try {
    const raw = window.localStorage.getItem(AUTH_USER_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<AuthUser>;
    if (typeof parsed?.id !== "string" || typeof parsed?.full_name !== "string") return null;
    return { id: parsed.id, full_name: parsed.full_name };
  } catch {
    return null;
  }
}

export function clearAuthSession() {
  try {
    window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
    window.localStorage.removeItem(AUTH_USER_STORAGE_KEY);
    window.localStorage.removeItem(DEMO_AUTH_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function isDemoAuthed(): boolean {
  return Boolean(getAuthToken());
}

export function demoSignIn() {
  setAuthSession("demo-token", { id: "demo-user", full_name: "Demo User" });
}

export function demoSignOut() {
  clearAuthSession();
}
