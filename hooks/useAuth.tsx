"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { Profile } from "@/types";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

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
  const supabase = createClient();
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

  // Fetch profile for a user
  const fetchProfile = useCallback(
    async (userId: string) => {
      const { data } = await supabase
        .from("profiles")
        .select("id, username, avatar_url, stellar_address, created_at")
        .eq("id", userId)
        .single();
      if (data) {
        const p = data as Profile;
        setProfile(p);
        ensureWallet(p);
      }
    },
    [supabase, ensureWallet]
  );

  // Listen for auth state changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    // Initial session check
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      if (u) {
        setUser(u);
        fetchProfile(u.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase, fetchProfile]);

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
          redirectTo: `${window.location.origin}/auth/callback`,
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
