"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Menu, X } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useBalance } from "wagmi";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  const { address, isConnected } = useAccount();
  const { data: bal } = useBalance({ address, query: { enabled: !!address } });

  const short = useMemo(() => {
    if (!address) return "";
    return `${address.slice(0, 6)}…${address.slice(-4)}`;
  }, [address]);

  const prettyBal = useMemo(() => {
    if (!bal) return null;
    const amount = Number(bal.formatted);
    return `${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${bal.symbol || "HBAR"}`;
  }, [bal]);

  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo (images from /public) */}
          <Link href="/" className="flex items-center space-x-2" aria-label="TeamFirst Home">
            {/* Square mark */}
            <Image
              src="/logo.png"
              width={32}
              height={32}
              alt="TeamFirst logo"
              className="rounded"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/clubs" className="text-foreground hover:text-primary transition-colors">
              Clubs
            </Link>
            <Link href="/me" className="text-foreground hover:text-primary transition-colors">
              Profile
            </Link>

            {/* Wallet Section */}
            <div className="flex items-center space-x-3">
              {isConnected && prettyBal && (
                <Badge variant="secondary" className="font-mono">{prettyBal}</Badge>
              )}
              <div className="ml-1">
                <ConnectButton
                  chainStatus="icon"
                  showBalance={false}
                  accountStatus={{ smallScreen: "avatar", largeScreen: "full" }}
                />
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-4">
            <Link
              href="/clubs"
              className="block text-foreground hover:text-primary transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Clubs
            </Link>
            <Link
              href="/me"
              className="block text-foreground hover:text-primary transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Profile
            </Link>

            {/* Mobile Wallet Section */}
            <div className="space-y-3 pt-2 border-t border-border">
              {isConnected && prettyBal && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Balance</span>
                  <Badge variant="secondary" className="font-mono">{prettyBal}</Badge>
                </div>
              )}

              <div className="w-full">
                <ConnectButton />
                {isConnected && short && (
                  <div className="mt-2 text-xs text-muted-foreground font-mono text-center">
                    {short}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
