"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { Profile } from "@/types";

interface WalletState {
  connected: boolean;
  address: string | null;
  profile: Profile | null;
  connecting: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletState>({
  connected: false,
  address: null,
  profile: null,
  connecting: false,
  error: null,
  connect: async () => {},
  disconnect: () => {},
});

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    setConnecting(true);
    setError(null);
    try {
      const freighterApi = await import("@stellar/freighter-api");

      const isAvailable = await freighterApi.isConnected();
      if (!isAvailable) {
        throw new Error(
          "Freighter wallet not found. Please install the Freighter browser extension."
        );
      }

      const addr = await freighterApi.requestAccess();
      setAddress(addr);
      setProfile({
        id: crypto.randomUUID(),
        stellar_address: addr,
        username: null,
        avatar_url: null,
        created_at: new Date().toISOString(),
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to connect wallet";
      setError(message);
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setProfile(null);
    setError(null);
  }, []);

  return (
    <WalletContext.Provider
      value={{
        connected: !!address,
        address,
        profile,
        connecting,
        error,
        connect,
        disconnect,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}
