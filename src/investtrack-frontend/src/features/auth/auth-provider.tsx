"use client";

import * as React from "react";
import type { CurrencyCode, Profile } from "@/types";
import * as authService from "./auth-service";

interface AuthContextValue {
  user: Profile | null;
  /** false até a sessão ser lida no cliente (evita flash/hidratação). */
  ready: boolean;
  signIn: (email: string) => Promise<void>;
  signUp: (input: { name: string; email: string; currency: CurrencyCode }) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (patch: Pick<Profile, "name" | "currency">) => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<Profile | null>(null);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    // Ler localStorage só no cliente, depois da hidratação.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUser(authService.getSession());
    setReady(true);
  }, []);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      ready,
      signIn: async (email) => setUser(await authService.signIn({ email })),
      signUp: async (input) => setUser(await authService.signUp(input)),
      signOut: async () => {
        await authService.signOut();
        setUser(null);
      },
      updateProfile: async (patch) => {
        if (!user) return;
        setUser(await authService.updateProfile(user.id, patch));
      },
    }),
    [user, ready],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>.");
  return ctx;
}
