"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import type { Profile } from "@/types";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { getAuthCallbackUrl } from "@/lib/auth/redirects";

interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string, username?: string) => Promise<string | null>;
  signInWithProvider: (provider: "google" | "github") => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({} as AuthState);

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Ensure user has a Stellar wallet (auto-create if missing)
  const ensureWallet = useCallback(async (currentProfile: Profile) => {
    if (currentProfile.stellar_address) return;
    try {
      const res = await fetch("/api/wallet/create", { method: "POST" });
      if (res.ok) {
        const { address } = await res.json();
        if (address) {
          setProfile((prev) =>
            prev ? { ...prev, stellar_address: address } : prev
          );
        }
      }
    } catch {
      // Non-fatal: wallet will be created on next load
    }
  }, []);

  // Listen for auth state changes. Keep this callback synchronous:
  // Supabase holds an auth lock while notifying subscribers, so awaiting
  // profile queries here can deadlock signInWithPassword and leave the
  // login button stuck on "Signing in...".
  useEffect(() => {
    let mounted = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      if (!session?.user) {
        setProfile(null);
      }
      setLoading(false);
    });

    // Initial session check
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      if (!mounted) return;
      setUser(u ?? null);
      if (!u) {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  // Fetch profile after auth state settles. This keeps Supabase queries out
  // of onAuthStateChange and avoids the login deadlock/race.
  useEffect(() => {
    if (!user?.id) {
      setProfile(null);
      return;
    }

    const userId = user.id;
    let cancelled = false;

    async function fetchProfile() {
      const { data } = await supabase
        .from("profiles")
        .select("id, username, avatar_url, stellar_address, created_at")
        .eq("id", userId)
        .single();

      if (!cancelled && data) {
        const p = data as Profile;
        setProfile(p);
        ensureWallet(p);
      }
    }

    fetchProfile().catch(() => {
      if (!cancelled) {
        setProfile(null);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [supabase, user?.id, ensureWallet]);

  const signIn = useCallback(
    async (email: string, password: string): Promise<string | null> => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return error?.message ?? null;
    },
    [supabase]
  );

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      username?: string
    ): Promise<string | null> => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username: username || null },
          emailRedirectTo: getAuthCallbackUrl("/map"),
        },
      });
      return error?.message ?? null;
    },
    [supabase]
  );

  const signInWithProvider = useCallback(
    async (provider: "google" | "github") => {
      await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: getAuthCallbackUrl("/map"),
        },
      });
    },
    [supabase]
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }, [supabase]);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signIn,
        signUp,
        signInWithProvider,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
