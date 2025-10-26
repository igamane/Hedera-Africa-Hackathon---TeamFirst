"use client";

import { useState, useEffect, useCallback, useRef } from "react";

type SessionData = {
  accountIds: string[];
  network: string;
  metadata: { name: string; description: string; url: string; icons: string[] };
};

export function useHashConnect() {
  const bootedRef = useRef(false);
  const hcRef = useRef<any>(null);

  const [ready, setReady] = useState(false);
  const [isPairing, setIsPairing] = useState(false);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [session, setSession] = useState<SessionData | null>(null);

  useEffect(() => {
    if (bootedRef.current) return;
    bootedRef.current = true;

    let mounted = true;

    async function boot() {
      try {
        const [{ HashConnect }, { LedgerId }] = await Promise.all([
          import("hashconnect"),
          import("@hashgraph/sdk"),
        ]);

        const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
        console.log("HC project:", projectId ? projectId.slice(0, 6) + "..." : "(missing)");
        if (!projectId) return;

        const icon =
          "data:image/svg+xml;utf8," +
          encodeURIComponent(
            `<svg xmlns='http://www.w3.org/2000/svg' width='128' height='128'><rect rx='24' width='128' height='128' fill='%233967EA'/><text x='50%' y='54%' dominant-baseline='middle' text-anchor='middle' font-family='Arial,Helvetica,sans-serif' font-size='56' fill='white'>T</text></svg>`
          );

        const appMetadata = {
          name: "TeamFirst",
          description: "Football Club Donation Platform",
          url: typeof window !== "undefined" ? window.location.origin : "http://localhost:3000",
          icons: [icon],
        };

        // HashConnect v3
        const hc = new HashConnect(LedgerId.TESTNET, projectId, appMetadata, false);
        hcRef.current = hc;

        hc.pairingEvent.on((pairing: SessionData) => {
          if (!mounted) return;
          setSession(pairing);
          setAccountId(pairing.accountIds?.[0] ?? null);
          try { hc.closePairingModal?.(); } catch {}
          setIsPairing(false);
        });

        hc.disconnectionEvent.on(() => {
          if (!mounted) return;
          setSession(null);
          setAccountId(null);
        });

        await hc.init(); // no args in v3
      } catch (e) {
        // Ignore WalletConnect Verify 400s on localhost
        console.warn("[HC init note]", e);
      } finally {
        if (mounted) setReady(true); // always enable the button
      }
    }

    boot();
    return () => {
      mounted = false;
    };
  }, []);

const connect = useCallback(async () => {
  if (!hcRef.current) throw new Error("HashConnect not loaded");
  if (session?.accountIds?.length) return;

  setIsPairing(true);

  // Important: do not pass partial theme options
  // Some versions expect a full theme object and will crash otherwise
  hcRef.current.openPairingModal();

  // close spinner once paired
  const off = hcRef.current.pairingEvent.on(() => {
    setIsPairing(false);
    try { hcRef.current.closePairingModal?.(); } catch {}
    off?.();
  });
}, [session]);


  const disconnect = useCallback(() => {
    if (!hcRef.current) return;
    try { hcRef.current.disconnect(); } catch {}
    setAccountId(null);
    setSession(null);
  }, []);

  return { ready, isPairing, accountId, session, connect, disconnect };
}
