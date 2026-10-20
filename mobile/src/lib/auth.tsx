import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api } from "./api";
import { getToken, setToken } from "./storage";
import { writeJSON } from "./store";

export type User = { id: number; email: string; name: string | null; plan: string; emailVerified: boolean; role: "user" | "admin"; birthYear?: number | null };
export type RegisterInput = {
  email: string; password: string; firstName: string; lastName: string; country: string; birthYear: number;
  acceptTerms: boolean; marketing: boolean; locale: string; city?: string; goal?: string;
};

// the year of birth tunes the Shams Method (pace, repetitions, test time) on this device, as on the website
// (RequireAccount / AccountLink write tf:age from the account)
const rememberAge = (year: number | null | undefined) => { if (year && Number.isInteger(year)) writeJSON("tf:age", year, true); };

type Ctx = {
  user: User | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
  refresh: () => Promise<void>;
};
const AuthContext = createContext<Ctx | null>(null);

// The account is the same as on quranmasterclass.com: one login, one progress, one Premium.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    if (!(await getToken())) { setUser(null); return; }
    try {
      const d = await api<{ user: User | null }>("/api/auth/me");
      setUser(d.user);
      rememberAge(d.user?.birthYear);
      if (!d.user) await setToken(null); // session expired on the server
    } catch { /* offline: keep what we have */ }
  }, []);

  useEffect(() => { refresh().finally(() => setReady(true)); }, [refresh]);

  const signIn = useCallback(async (path: string, body: unknown, birthYear?: number) => {
    const d = await api<{ user: User; token?: string }>(path, { body });
    if (d.token) await setToken(d.token);
    setUser(d.user);
    rememberAge(d.user?.birthYear ?? birthYear);
  }, []);

  const value = useMemo<Ctx>(() => ({
    user, ready, refresh,
    login: (email, password) => signIn("/api/auth/login", { email, password }),
    register: (input) => signIn("/api/auth/register", input, input.birthYear),
    logout: async () => {
      await api("/api/auth/logout", { body: {} }).catch(() => undefined);
      await setToken(null);
      setUser(null);
    },
    deleteAccount: async (password) => {
      await api("/api/account", { body: { action: "delete", current: password } });
      await setToken(null);
      setUser(null);
    },
  }), [user, ready, refresh, signIn]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): Ctx {
  const c = useContext(AuthContext);
  if (!c) throw new Error("useAuth outside AuthProvider");
  return c;
}
