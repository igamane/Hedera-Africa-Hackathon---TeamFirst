"use client";

import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  rainbowWallet,
  walletConnectWallet,
  braveWallet,
  metaMaskWallet,
  trustWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { createConfig, http } from "wagmi";
import { hederaTestnet } from "wagmi/chains";

// WalletConnect project id
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "";
if (!projectId) console.warn("[wagmi] NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is missing.");

const connectors = connectorsForWallets(
  [
    {
      groupName: "Recommended",
      wallets: [rainbowWallet, walletConnectWallet, braveWallet, metaMaskWallet, trustWallet],
    },
  ],
  { appName: "TeamFirst", projectId }
);

// Testnet only - simplest way to avoid connecting to mainnet by mistake
export const wagmiConfig = createConfig({
  connectors,
  chains: [hederaTestnet],
  transports: {
    [hederaTestnet.id]: http("https://testnet.hashio.io/api"), // reliable Hedera RPC
  },
  multiInjectedProviderDiscovery: true,
});

export const INITIAL_CHAIN = hederaTestnet;
