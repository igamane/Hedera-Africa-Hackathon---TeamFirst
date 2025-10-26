"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { ArrowRight, Users, TrendingUp, Shield, Zap } from "lucide-react";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function HomePage() {
  // Mock data for landing stats
  const totalDonations = "1,247,892";
  const totalClubs = 156;
  const totalDonors = 8432;

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-20 lg:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-bold text-balance mb-6">
                Support Your Favorite <span className="text-primary">Football Clubs</span> with Hedera
              </h1>
              <p className="text-xl text-muted-foreground text-pretty mb-8 max-w-2xl mx-auto">
                Connect your wallet and make secure, transparent donations to football clubs worldwide. Every
                contribution is recorded on the Hedera network for complete transparency.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                {/* RainbowKit multi wallet connect */}
                <div className="inline-flex">
                  <ConnectButton
                    chainStatus="icon"
                    showBalance={false}
                    accountStatus={{ smallScreen: "avatar", largeScreen: "full" }}
                  />
                </div>
                <Link href="/clubs">
                  <Button variant="outline" size="lg" className="text-lg px-8 py-6 bg-transparent">
                    Browse All Clubs
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-primary mb-2">{totalDonations} HBAR</div>
                    <div className="text-sm text-muted-foreground">Total Donated</div>
                  </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-secondary mb-2">{totalClubs}</div>
                    <div className="text-sm text-muted-foreground">Active Clubs</div>
                  </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-accent mb-2">{totalDonors.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Happy Supporters</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose TeamFirst?</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Built on Hedera for secure, transparent, and efficient donations
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Secure & Transparent</h3>
                  <p className="text-sm text-muted-foreground">
                    All donations are recorded on chain so anyone can verify totals
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-6 h-6 text-secondary" />
                  </div>
                  <h3 className="font-semibold mb-2">Instant Donations</h3>
                  <p className="text-sm text-muted-foreground">
                    Fast and low cost with Hedera network finality
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Users className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="font-semibold mb-2">Community Driven</h3>
                  <p className="text-sm text-muted-foreground">
                    Join thousands of football fans supporting their favorite clubs
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Real time Tracking</h3>
                  <p className="text-sm text-muted-foreground">
                    Watch live donation feeds and see your impact in real time
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary/5">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Support Your Team?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Connect your wallet and start making a difference today
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="inline-flex">
                <ConnectButton />
              </div>
              <Link href="/clubs">
                <Button variant="outline" size="lg" className="text-lg px-8 py-6 bg-transparent">
                  Explore Clubs
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
