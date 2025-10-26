"use client";

import { createContext, useContext, useMemo, useState, useEffect, type ReactNode } from "react";
import { useHashConnect } from "@/hooks/use-hash-connect";

type WalletContextType = {
  isConnected: boolean;
  accountId: string | null;
  network: "testnet";
  balance: number | null;
  isLoading: boolean;
  error: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}; 

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const { connect, disconnect, accountId, ready, isPairing } = useHashConnect();

  
  const network = "testnet" as const;
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isConnected = !!accountId;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!accountId) {
        setBalance(null);
        return;
      }
      try {
        const res = await fetch(`https://testnet.mirrornode.hedera.com/api/v1/accounts/${accountId}`);
        if (!res.ok) throw new Error(`mirror ${res.status}`);
        const data = await res.json();
        const tb = data?.balance?.balance ?? 0;
        const hbar = tb / 100_000_000;
        if (!cancelled) setBalance(hbar);
      } catch {
        if (!cancelled) setBalance(null);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [accountId]);

const connectWallet = async () => {
  setError(null);
  setIsLoading(true);
  try {
    await connect();
  } catch (e) {
    console.error("Open pairing modal failed", e);
    setError("Could not open the wallet pairing modal.");
  } finally {
    setIsLoading(false);
  }
};



  const disconnectWallet = () => {
    try {
      disconnect();
      setBalance(null);
      setError(null);
    } catch {
      setError("Failed to disconnect wallet.");
    }
  };



  const value = useMemo(() => ({
  isConnected,
  accountId,
  network,
  balance,
  isLoading: isLoading || isPairing,   // keeps the button in "Connecting..." while QR is shown
  error,
  connectWallet,
  disconnectWallet,
}), [isConnected, accountId, network, balance, isLoading, isPairing, error]);

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within a WalletProvider");
  return ctx;
}
