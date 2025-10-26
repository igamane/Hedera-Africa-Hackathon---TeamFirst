"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import useSWR, { useSWRConfig } from "swr";
import Image from "next/image";
import { useParams } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useBalance, useSendTransaction } from "wagmi";
import { parseEther } from "viem";

import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  MapPin, Users, TrendingUp, Wallet, Clock, Trophy, Activity,
  CheckCircle, ExternalLink, AlertCircle,
} from "lucide-react";
import { useRealTime } from "@/lib/real-time-context";
import { useToast } from "@/hooks/use-toast";

// ---------------------------------------------------------------------
// Data (KEEP your long mockClubs array exactly as-is; unchanged below)
// ---------------------------------------------------------------------
type Club = {
  id: number;
  name: string;
  logo: string;
  bio: string;
  totalRaised: number;
  location: string;
  country: string;
  category: string;
  supporters: number;
  accountId?: string;
  evmAddress?: `0x${string}`;
  description?: string;
};

const mockClubs: Club[] = [
  // Senegal
  { id: 7, name: "ASC Jaraaf", logo: "https://res.cloudinary.com/doaxoti6i/image/upload/v1761503357/S%C3%A9n%C3%A9gal_page-0001_nqlzoj.jpg", bio: "Historic Dakar club with multiple Senegal Ligue 1 titles.", totalRaised: 18320, location: "Dakar, Senegal", country: "Senegal", category: "Ligue 1 (Senegal)", supporters: 920 },
  { id: 8, name: "Teungueth FC", logo: "https://res.cloudinary.com/doaxoti6i/image/upload/v1761503357/S%C3%A9n%C3%A9gal_page-0002_keyefk.jpg", bio: "Rufisque-based club known for strong continental runs.", totalRaised: 14650, location: "Rufisque, Senegal", country: "Senegal", category: "Ligue 1 (Senegal)", supporters: 740 },
  { id: 9, name: "Génération Foot", logo: "https://res.cloudinary.com/doaxoti6i/image/upload/v1761503358/S%C3%A9n%C3%A9gal_page-0003_yqbh9j.jpg", bio: "Elite academy club famed for player development.", totalRaised: 21240, location: "Déni Biram Ndao (Dakar), Senegal", country: "Senegal", category: "Ligue 1 (Senegal)", supporters: 1110 },
  { id: 10, name: "Guédiawaye FC", logo: "https://res.cloudinary.com/doaxoti6i/image/upload/v1761503358/S%C3%A9n%C3%A9gal_page-0004_ccn2sb.jpg", bio: "Ambitious club from Guédiawaye in the Dakar region.", totalRaised: 12780, location: "Guédiawaye, Senegal", country: "Senegal", category: "Ligue 1 (Senegal)", supporters: 630 },

  // Morocco
  { id: 11, name: "Raja Club Athletic", logo: "https://res.cloudinary.com/doaxoti6i/image/upload/v1761503359/maroc_page-0003_adaazx.jpg", bio: "One of Morocco’s giants with a massive fanbase.", totalRaised: 51230, location: "Casablanca, Morocco", country: "Morocco", category: "Botola Pro", supporters: 3420 },
  { id: 12, name: "Hassania Union Sport Agadir (HUSA)", logo: "https://res.cloudinary.com/doaxoti6i/image/upload/v1761503358/maroc_page-0002_ikvi0y.jpg", bio: "Traditional club from Agadir with passionate support.", totalRaised: 23150, location: "Agadir, Morocco", country: "Morocco", category: "Botola Pro", supporters: 1200 },
  { id: 13, name: "Ittihad Riadi de Tanger (IR Tanger)", logo: "https://res.cloudinary.com/doaxoti6i/image/upload/v1761503358/maroc_page-0001_yu8zql.jpg", bio: "Northern powerhouse representing the city of Tangier.", totalRaised: 26400, location: "Tangier, Morocco", country: "Morocco", category: "Botola Pro", supporters: 1380 },
  { id: 14, name: "Maghreb de Fès (MAS Fes)", logo: "https://res.cloudinary.com/doaxoti6i/image/upload/v1761503358/maroc_page-0004_vdcams.jpg", bio: "Historic club from Fez with continental pedigree.", totalRaised: 24760, location: "Fez, Morocco", country: "Morocco", category: "Botola Pro", supporters: 1290 },

  // Côte d’Ivoire
  { id: 15, name: "ASEC Mimosas", logo: "https://res.cloudinary.com/doaxoti6i/image/upload/v1761503520/C%C3%B4te_d_Ivoire_page-0001_nqbmdx.jpg", bio: "Legendary Ivorian club and Africa’s top talent factory.", totalRaised: 31200, location: "Abidjan, Côte d’Ivoire", country: "Côte d’Ivoire", category: "Ligue 1 (Ivory Coast)", supporters: 1880 },
  { id: 16, name: "Stade d’Abidjan", logo: "https://res.cloudinary.com/doaxoti6i/image/upload/v1761503520/C%C3%B4te_d_Ivoire_page-0002_dhjmsw.jpg", bio: "Historic club from Abidjan with several domestic titles.", totalRaised: 17450, location: "Abidjan, Côte d’Ivoire", country: "Côte d’Ivoire", category: "Ligue 1 (Ivory Coast)", supporters: 940 },
  { id: 17, name: "Société Omnisports de l’Armée (SOA)", logo: "https://res.cloudinary.com/doaxoti6i/image/upload/v1761503520/C%C3%B4te_d_Ivoire_page-0003_tiueth.jpg", bio: "Military-backed club known for discipline and strength.", totalRaised: 19670, location: "Yamoussoukro, Côte d’Ivoire", country: "Côte d’Ivoire", category: "Ligue 1 (Ivory Coast)", supporters: 1040 },
  { id: 18, name: "Sporting Club de Gagnoa", logo: "https://res.cloudinary.com/doaxoti6i/image/upload/v1761503521/C%C3%B4te_d_Ivoire_page-0004_fqocls.jpg", bio: "Proud club from Gagnoa with a strong regional following.", totalRaised: 15340, location: "Gagnoa, Côte d’Ivoire", country: "Côte d’Ivoire", category: "Ligue 1 (Ivory Coast)", supporters: 870 },

  // South Africa
  { id: 19, name: "Kaizer Chiefs", logo: "https://res.cloudinary.com/doaxoti6i/image/upload/v1761503595/South_Africa_page-0001_cegv2r.jpg", bio: "One of Africa’s most popular and decorated football clubs.", totalRaised: 58900, location: "Johannesburg, South Africa", country: "South Africa", category: "Premier Soccer League", supporters: 4020 },
  { id: 20, name: "Mamelodi Sundowns", logo: "https://res.cloudinary.com/doaxoti6i/image/upload/v1761503595/South_Africa_page-0002_v6x5zo.jpg", bio: "The Brazilians – modern African powerhouse club.", totalRaised: 62350, location: "Pretoria, South Africa", country: "South Africa", category: "Premier Soccer League", supporters: 4210 },
  { id: 21, name: "Bloemfontein Celtic (Siwelele FC)", logo: "https://res.cloudinary.com/doaxoti6i/image/upload/v1761503596/South_Africa_page-0003_u1o3wc.jpg", bio: "Club famous for passionate fans and green colors.", totalRaised: 21980, location: "Bloemfontein, South Africa", country: "South Africa", category: "Premier Soccer League", supporters: 1410 },
  { id: 22, name: "Orlando Pirates", logo: "https://res.cloudinary.com/doaxoti6i/image/upload/v1761503596/South_Africa_page-0004_zahzrk.jpg", bio: "Historic Soweto club and one of South Africa’s giants.", totalRaised: 57440, location: "Johannesburg, South Africa", country: "South Africa", category: "Premier Soccer League", supporters: 3950 },

  // Cameroon
  { id: 23, name: "Coton Sport FC de Garoua", logo: "https://res.cloudinary.com/doaxoti6i/image/upload/v1761503743/Cameroon_page-0002_jsx3ox.jpg", bio: "Cameroon’s dominant club with multiple Elite One titles and strong CAF performances.", totalRaised: 28400, location: "Garoua, Cameroon", country: "Cameroon", category: "Elite One (Cameroon)", supporters: 1670 },
  { id: 24, name: "Canon Sportif de Yaoundé", logo: "https://res.cloudinary.com/doaxoti6i/image/upload/v1761503743/Cameroon_page-0003_tqt6wo.jpg", bio: "Historic club from Yaoundé known for its legendary players and continental success.", totalRaised: 26150, location: "Yaoundé, Cameroon", country: "Cameroon", category: "Elite One (Cameroon)", supporters: 1420 },
  { id: 25, name: "Aigle Royal FC", logo: "https://res.cloudinary.com/doaxoti6i/image/upload/v1761503744/Cameroon_page-0004_ao1zaq.jpg", bio: "Rising club symbolized by the eagle, representing ambition and strength.", totalRaised: 17890, location: "Menoua, Cameroon", country: "Cameroon", category: "Elite One (Cameroon)", supporters: 880 },
  { id: 26, name: "Union Sportive de Douala", logo: "https://res.cloudinary.com/doaxoti6i/image/upload/v1761503744/Cameroon_page-0001_ois67r.jpg", bio: "One of Cameroon’s oldest and most successful clubs, representing Douala.", totalRaised: 29520, location: "Douala, Cameroon", country: "Cameroon", category: "Elite One (Cameroon)", supporters: 1830 },

  // Mali
  { id: 27, name: "Stade Malien de Sikasso", logo: "https://res.cloudinary.com/doaxoti6i/image/upload/v1761503800/Mali_page-0001_k2mmah.jpg", bio: "Competitive club from Sikasso known for its consistent league performances.", totalRaised: 15260, location: "Sikasso, Mali", country: "Mali", category: "Ligue 1 (Mali)", supporters: 870 },
  { id: 28, name: "Djoliba AC", logo: "https://res.cloudinary.com/doaxoti6i/image/upload/v1761503800/Mali_page-0002_okmqh1.jpg", bio: "One of Mali’s biggest clubs with a long history of domestic dominance.", totalRaised: 28750, location: "Bamako, Mali", country: "Mali", category: "Ligue 1 (Mali)", supporters: 1650 },
  { id: 29, name: "AS Real Bamako", logo: "https://res.cloudinary.com/doaxoti6i/image/upload/v1761503800/Mali_page-0003_f3ajri.jpg", bio: "Historic Bamako club known for its fierce rivalry with Djoliba AC.", totalRaised: 25460, location: "Bamako, Mali", country: "Mali", category: "Ligue 1 (Mali)", supporters: 1520 },
  { id: 30, name: "Stade Malien de Bamako", logo: "https://res.cloudinary.com/doaxoti6i/image/upload/v1761503801/Mali_page-0004_hsyjpf.jpg", bio: "Mali’s most decorated club with multiple league and CAF titles.", totalRaised: 31280, location: "Bamako, Mali", country: "Mali", category: "Ligue 1 (Mali)", supporters: 1910 },

  // Egypt
  { id: 31, name: "Al Ahly SC", logo: "https://res.cloudinary.com/doaxoti6i/image/upload/v1761503859/Egypt_page-0001_bvkgnm.jpg", bio: "Africa’s most decorated club, nicknamed 'The Club of the Century'.", totalRaised: 87200, location: "Cairo, Egypt", country: "Egypt", category: "Egyptian Premier League", supporters: 5120 },
  { id: 32, name: "Al Masry SC", logo: "https://res.cloudinary.com/doaxoti6i/image/upload/v1761503860/Egypt_page-0002_t0e8jd.jpg", bio: "Port Said’s pride, known for passionate fans and competitive spirit.", totalRaised: 29850, location: "Port Said, Egypt", country: "Egypt", category: "Egyptian Premier League", supporters: 1710 },
  { id: 33, name: "Zamalek SC", logo: "https://res.cloudinary.com/doaxoti6i/image/upload/v1761503860/Egypt_page-0003_opzqeb.jpg", bio: "Historic rival to Al Ahly with a rich history of continental titles.", totalRaised: 78450, location: "Cairo, Egypt", country: "Egypt", category: "Egyptian Premier League", supporters: 4780 },
  { id: 34, name: "Ismaily SC", logo: "https://res.cloudinary.com/doaxoti6i/image/upload/v1761503861/Egypt_page-0004_i5dzrf.jpg", bio: "The Yellow Dragons, known for their creative style and loyal base.", totalRaised: 35740, location: "Ismailia, Egypt", country: "Egypt", category: "Egyptian Premier League", supporters: 2090 },

  // Nigeria
  { id: 35, name: "Enyimba FC", logo: "https://res.cloudinary.com/doaxoti6i/image/upload/v1761503930/Nigeria_page-0001_xx5sch.jpg", bio: "The People’s Elephant, Nigeria’s most successful club in CAF history.", totalRaised: 44680, location: "Aba, Nigeria", country: "Nigeria", category: "Nigeria Premier Football League", supporters: 2730 },
  { id: 36, name: "Kaduna United FC", logo: "https://res.cloudinary.com/doaxoti6i/image/upload/v1761503931/Nigeria_page-0002_x2f4ca.jpg", bio: "Dynamic team from northern Nigeria, famous for its youth academy.", totalRaised: 21640, location: "Kaduna, Nigeria", country: "Nigeria", category: "Nigeria Premier Football League", supporters: 1310 },
  { id: 37, name: "Kano Pillars FC", logo: "https://res.cloudinary.com/doaxoti6i/image/upload/v1761503931/Nigeria_page-0003_n90xwo.jpg", bio: "One of Nigeria’s giants, celebrated for its fanbase and league success.", totalRaised: 37290, location: "Kano, Nigeria", country: "Nigeria", category: "Nigeria Premier Football League", supporters: 2230 },
  { id: 38, name: "Wikki Tourists FC", logo: "https://res.cloudinary.com/doaxoti6i/image/upload/v1761503933/Nigeria_page-0004_kr961d.jpg", bio: "Bauchi’s pride, recognized for its vibrant red-and-yellow colors.", totalRaised: 18780, location: "Bauchi, Nigeria", country: "Nigeria", category: "Nigeria Premier Football League", supporters: 970 },

  // Algeria
  { id: 39, name: "USM Alger", logo: "https://res.cloudinary.com/doaxoti6i/image/upload/v1761503972/Alger_page-0001_zdnwtu.jpg", bio: "Union Sportive de la Médina d’Alger — multiple-time Algerian champions.", totalRaised: 40210, location: "Algiers, Algeria", category: "Ligue Professionnelle 1 (Algeria)", supporters: 3900, country: "Algeria" },
  { id: 40, name: "ES Sétif", logo: "https://res.cloudinary.com/doaxoti6i/image/upload/v1761503973/Alger_page-0002_ou92kj.jpg", bio: "Entente Sportive Sétifienne — historic club with continental titles.", totalRaised: 35600, location: "Sétif, Algeria", category: "Ligue Professionnelle 1 (Algeria)", supporters: 3400, country: "Algeria" },
  { id: 41, name: "CR Belouizdad", logo: "https://res.cloudinary.com/doaxoti6i/image/upload/v1761503974/Alger_page-0003_b3juta.jpg", bio: "Chabab Riadhi de Belouizdad — powerhouse from the Belouizdad district.", totalRaised: 33150, location: "Algiers, Algeria", category: "Ligue Professionnelle 1 (Algeria)", supporters: 3200, country: "Algeria" },
  { id: 42, name: "JS Kabylie", logo: "https://res.cloudinary.com/doaxoti6i/image/upload/v1761503973/Alger_page-0004_goho74.jpg", bio: "Jeunesse Sportive de Kabylie — one of Algeria’s most decorated clubs.", totalRaised: 29800, location: "Tizi Ouzou, Algeria", category: "Ligue Professionnelle 1 (Algeria)", supporters: 2800, country: "Algeria" },

  // Tunisia
  { id: 43, name: "Espérance Sportive de Tunis", logo: "https://res.cloudinary.com/doaxoti6i/image/upload/v1761504029/Tunisie_page-0001_ecjlba.jpg", bio: "EST — the Blood & Gold of Tunis, dominant domestically and in Africa.", totalRaised: 45200, location: "Tunis, Tunisia", category: "Ligue Professionnelle 1 (Tunisia)", supporters: 5000, country: "Tunisia" },
  { id: 44, name: "Club Africain", logo: "https://res.cloudinary.com/doaxoti6i/image/upload/v1761504029/Tunisie_page-0002_dp5b7f.jpg", bio: "Club Africain — historic rivals from the capital city.", totalRaised: 38900, location: "Tunis, Tunisia", category: "Ligue Professionnelle 1 (Tunisia)", supporters: 4600, country: "Tunisia" },
  { id: 45, name: "Étoile Sportive du Sahel", logo: "https://res.cloudinary.com/doaxoti6i/image/upload/v1761504030/Tunisie_page-0003_pprkox.jpg", bio: "ESS — giants from Sousse with a rich continental record.", totalRaised: 36500, location: "Sousse, Tunisia", category: "Ligue Professionnelle 1 (Tunisia)", supporters: 4100, country: "Tunisia" },
  { id: 46, name: "Club Sportif Sfaxien", logo: "https://res.cloudinary.com/doaxoti6i/image/upload/v1761504031/Tunisie_page-0004_xsb07x.jpg", bio: "CSS — perennial contenders from the port city of Sfax.", totalRaised: 31000, location: "Sfax, Tunisia", category: "Ligue Professionnelle 1 (Tunisia)", supporters: 3600, country: "Tunisia" },
];

// ---------------------------------------------------------------------
// Config & helpers
// ---------------------------------------------------------------------
const fetcher = (url: string) => fetch(url).then((r) => r.json());

const DEMO_EVM = process.env.NEXT_PUBLIC_DEMO_RECIPIENT_EVM as `0x${string}` | undefined;
const SHOULD_MINT = process.env.NEXT_PUBLIC_MINT_BADGE === "true";
const HS_BASE = "https://hashscan.io/#/testnet";
const hsSearch = (q: string) => `${HS_BASE}/search/${encodeURIComponent(q)}`;

type MintResult = { tokenId: string; serial: number; transferred: boolean; note?: string };

// ---------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------
export default function ClubPage() {
  const params = useParams();
  const clubId = String(params?.id || "");
  const numericId = Number(clubId);

  // Mount gate to avoid SSR/CSR markup mismatch on wallet-dependent UI
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const found = useMemo(() => mockClubs.find((c) => c.id === numericId), [numericId]);

  if (!found) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1">
          <section className="py-16">
            <div className="max-w-3xl mx-auto px-4 text-center">
              <div className="text-5xl mb-4">😕</div>
              <h1 className="text-2xl font-semibold mb-2">Club not found</h1>
              <p className="text-muted-foreground mb-6">
                We couldn’t find a club with id <span className="font-mono">{clubId}</span>.
              </p>
              <Button asChild><a href="/clubs">Back to clubs</a></Button>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  const club: Required<Pick<Club,
    "id" | "name" | "logo" | "bio" | "totalRaised" | "location" | "country" | "category" | "supporters"
  >> & { accountId: string; evmAddress?: `0x${string}`; description: string } = {
    ...found,
    accountId: found.accountId || "0.0.123456",
    evmAddress: found.evmAddress || DEMO_EVM,
    description: found.description || found.bio || "Support this club.",
  };

  const { mutate } = useSWRConfig();
  const [donationAmount, setDonationAmount] = useState("");
  const [lastTransaction, setLastTransaction] = useState<any>(null);
  const [lastBadge, setLastBadge] = useState<MintResult | null>(null);
  const [isDonating, setIsDonating] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  const { donations, clubStats, isConnected: realtimeConnected, addDonation } = useRealTime();
  const { toast } = useToast();

  const { address, isConnected } = useAccount();
  const { data: balanceData } = useBalance({ address, query: { enabled: !!address } });
  const balance = useMemo(() => (balanceData ? Number(balanceData.formatted) : null), [balanceData]);
  const { sendTransactionAsync } = useSendTransaction();

  const currentClubStats = clubStats.get(clubId);

  // -------- Server data (real DB) --------
  const leaderboardUrl =
    club.evmAddress ? `/api/leaderboard?evm=${club.evmAddress}`
    : club.accountId ? `/api/leaderboard?account=${encodeURIComponent(club.accountId)}`
    : null;

  const feedUrl = `/api/feed?clubId=${encodeURIComponent(clubId)}`;
  const meUrl = address ? `/api/me?evm=${address}` : null;

  const { data: lb, isLoading: lbLoading } = useSWR(leaderboardUrl, fetcher, {
    refreshInterval: 12000,
    revalidateOnFocus: false,
  });
  const { data: feedData } = useSWR(feedUrl, fetcher, {
    refreshInterval: 10000,
    revalidateOnFocus: false,
  });
  const { data: me } = useSWR(meUrl, fetcher, {
    refreshInterval: 15000,
    revalidateOnFocus: false,
  });

  // Pending/unclaimed NFT from DB on load
  const pendingFromDb: MintResult | null = useMemo(() => {
    if (!me) return null;
    if (Array.isArray(me?.pending) && me.pending.length > 0) {
      const p = me.pending[0];
      return { tokenId: p.tokenId, serial: Number(p.serial), transferred: false };
    }
    if (Array.isArray(me?.nfts)) {
      const notTransferred = me.nfts.filter((n: any) => !n.transferred);
      if (notTransferred.length > 0) {
        const n = notTransferred.sort((a: any, b: any) =>
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        )[0];
        return { tokenId: n.tokenId, serial: Number(n.serial), transferred: false };
      }
    }
    return null;
  }, [me]);

  useEffect(() => {
    if (!lastBadge && pendingFromDb) setLastBadge(pendingFromDb);
  }, [pendingFromDb, lastBadge]);

  // Merge live donations with DB feed
  const serverFeed: Array<{ id?: string; fanId: string; amount: number; txId: string; timestamp: string }> = useMemo(() => {
    const raw = Array.isArray(feedData?.items) ? feedData.items : Array.isArray(feedData) ? feedData : [];
    return raw.map((x: any) => ({
      id: x.id || x._id || `${x.txHash || x.transactionId || ""}-${x.amountHBAR ?? x.amount ?? 0}-${x.timestamp || x.createdAt || ""}`,
      fanId: x.fanId || x.donorLabel || (x.donorEvm ? `Fan#${x.donorEvm.slice(-4)}` : "Supporter"),
      amount: Number(x.amountHBAR ?? x.amount ?? 0),
      txId: x.txId || x.transactionId || x.txHash || "",
      timestamp: x.timestamp || x.consensusAt || x.createdAt || new Date().toISOString(),
    }));
  }, [feedData]);

  const liveFeed = donations
    .filter((d) => d.clubId === clubId)
    .map((d) => ({ id: d.id, fanId: d.fanId, amount: d.amount, txId: d.txId, timestamp: d.timestamp }));

  const clubDonations = useMemo(() => {
    const all = [...liveFeed, ...serverFeed];
    const seen = new Set<string>();
    const uniq: typeof all = [];
    for (const item of all) {
      const key = item.txId || item.id || `${item.amount}-${item.timestamp}`;
      if (seen.has(key)) continue;
      seen.add(key);
      uniq.push(item);
    }
    uniq.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return uniq.map((d) => ({ ...d, timestamp: relativeTime(d.timestamp) }));
  }, [liveFeed, serverFeed]);

  // Toast once per newest tx to avoid rapid re-firing (prevents Radix recursion)
  const lastToastTxId = useRef<string | null>(null);
  useEffect(() => {
    const latest = (liveFeed[0] && liveFeed[0].txId) ? liveFeed[0] : (serverFeed[0] || null);
    if (!latest || !latest.txId) return;
    if (lastToastTxId.current === latest.txId) return;
    lastToastTxId.current = latest.txId;
    toast({ title: "New Donation Received", description: `${latest.fanId} donated ${latest.amount} HBAR` });
  }, [liveFeed, serverFeed, toast]);

  async function postReceiptToHCS(payload: {
    clubId: string; clubName: string; donor: string; amountHBAR: number; txHash: string;
  }) {
    const res = await fetch("/api/hcs/receipt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error((await res.text()) || "HCS receipt failed");
    return res.json();
  }

  const handleDonate = async () => {
    if (!donationAmount || !isConnected || !club) return;
    if (!club.evmAddress) {
      toast({
        title: "Missing club address",
        description: "Set NEXT_PUBLIC_DEMO_RECIPIENT_EVM or club.evmAddress.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsDonating(true);
      toast({ title: "Processing Donation", description: "Transaction is being sent..." });

      const valueHBAR = Number.parseFloat(donationAmount || "0") || 0;
      const txHash = await sendTransactionAsync({
        to: club.evmAddress,
        value: parseEther(String(valueHBAR)),
      });

      const tx = { amount: valueHBAR, txId: txHash, timestamp: new Date().toISOString() };
      setLastTransaction(tx);

      addDonation({
        clubId,
        clubName: club.name,
        fanId: `Fan#${address?.slice(-4) || "0000"}`,
        amount: tx.amount,
        txId: txHash,
      });

      await postReceiptToHCS({
        clubId,
        clubName: club.name,
        donor: address as string,
        amountHBAR: valueHBAR,
        txHash,
      });

      if (SHOULD_MINT && address) {
        try {
          const res = await fetch("/api/nft/mint", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ donorEvm: address, clubId, amountHBAR: valueHBAR, txHash }),
          });
          const j = await res.json();
          if (res.ok) {
            setLastBadge({ tokenId: j.tokenId, serial: j.serial, transferred: !!j.transferred, note: j.note });
            toast({
              title: j.transferred ? "Badge delivered" : "Badge minted",
              description: j.transferred
                ? `Serial #${j.serial} from ${j.tokenId}`
                : `Serial #${j.serial} reserved in treasury. Associate the collection, then tap Claim.`,
            });
            if (meUrl) await mutate(meUrl);
          } else {
            console.warn("Badge mint failed:", j);
          }
        } catch (e) {
          console.warn("Badge mint error", e);
        }
      }

      if (leaderboardUrl) await mutate(leaderboardUrl);
      await mutate(feedUrl);

      setDonationAmount("");
      toast({ title: "Donation Successful", description: `Donated ${tx.amount} HBAR to ${club.name}.` });
    } catch (error: any) {
      console.error("Donation failed:", error);
      toast({
        title: "Donation Failed",
        description: error?.shortMessage || error?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDonating(false);
    }
  };

  async function handleClaim() {
    if (!lastBadge || !address) return;
    try {
      setIsClaiming(true);
      const res = await fetch("/api/nft/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokenId: lastBadge.tokenId, serial: lastBadge.serial, donorEvm: address }),
      });
      const j = await res.json();
      if (res.ok) {
        setLastBadge({ ...lastBadge, transferred: true });
        toast({ title: "Badge delivered", description: `Serial #${lastBadge.serial} from ${lastBadge.tokenId}` });
        if (meUrl) await mutate(meUrl);
      } else {
        toast({
          title: "Claim failed",
          description: j?.error || "Make sure your account is associated with the token.",
          variant: "destructive",
        });
      }
    } finally {
      setIsClaiming(false);
    }
  }

  const quickAmounts = [10, 25, 50, 100, 250, 500];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1">
        {/* Header */}
        <section className="bg-gradient-to-r from-primary/10 via-background to-secondary/10 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
              <div className="relative w-24 h-24 lg:w-32 lg:h-32 rounded-full overflow-hidden bg-muted flex-shrink-0">
                <Image src={club.logo || "/placeholder.svg"} alt={`${club.name} logo`} fill className="object-cover" />
              </div>

              <div className="flex-1">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-4">
                  <h1 className="text-3xl lg:text-4xl font-bold">{club.name}</h1>
                  <Badge variant="secondary" className="w-fit">{club.category}</Badge>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-4">
                  <div className="flex items-center"><MapPin className="w-4 h-4 mr-1" />{club.location}</div>
                  <div className="flex items-center"><Users className="w-4 h-4 mr-1" />{club.supporters.toLocaleString()} supporters</div>
                  <div className="flex items-center">
                    <Wallet className="w-4 h-4 mr-1" />
                    {club.accountId}{club.evmAddress ? ` • ${club.evmAddress.slice(0, 6)}...${club.evmAddress.slice(-4)}` : ""}
                  </div>
                </div>

                <p className="text-muted-foreground max-w-3xl">{club.description}</p>
              </div>

              <div className="text-center lg:text-right">
                <div className="text-3xl lg:text-4xl font-bold text-primary mb-1">
                  {(lb?.totalRaisedHBAR ?? currentClubStats?.totalRaised ?? club.totalRaised).toLocaleString()} HBAR
                </div>
                <div className="text-sm text-muted-foreground">Total Raised</div>
              </div>
            </div>
          </div>
        </section>

        {/* Body */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Donate */}
              <div className="lg:col-span-1">
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2 text-primary" />Make a Donation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Wallet status (gated by `mounted` to prevent SSR/CSR mismatch) */}
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="text-sm font-medium">Wallet Status</span>
                      <div className="flex items-center">
                        {mounted && isConnected ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                            <span className="text-sm text-green-600">Connected</span>
                          </>
                        ) : (
                          <>
                            <div className="w-4 h-4 bg-orange-500 rounded-full mr-1" />
                            <span className="text-sm text-orange-600">Not Connected</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Connect + balance sections also gated */}
                    {!mounted || !isConnected ? (
                      <div className="space-y-3">
                        {mounted && <ConnectButton />}
                        <div className="flex items-center text-muted-foreground text-xs">
                          <AlertCircle className="w-3 h-3 mr-1" />Use HashPack, MetaMask, Brave, or Trust Wallet
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                          <span className="text-sm font-medium">Your Balance</span>
                          <span className="font-bold text-primary">
                            {typeof balance === "number" ? balance.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "0"} HBAR
                          </span>
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-3 block">Quick Amounts (HBAR)</label>
                          <div className="grid grid-cols-3 gap-2">
                            {[10, 25, 50, 100, 250, 500].map((amt) => (
                              <Button
                                key={amt}
                                variant="outline"
                                size="sm"
                                onClick={() => setDonationAmount(String(amt))}
                                className="text-xs"
                                disabled={typeof balance === "number" && amt > balance}
                              >
                                {amt}
                              </Button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-2 block">Custom Amount (HBAR)</label>
                          <Input
                            type="number"
                            placeholder="Enter amount"
                            value={donationAmount}
                            onChange={(e) => setDonationAmount(e.target.value)}
                            className="text-lg"
                            max={balance || undefined}
                          />
                          {typeof balance === "number" && Number.parseFloat(donationAmount || "0") > balance &&
                            <p className="text-sm text-red-600 mt-1">Insufficient balance</p>}
                        </div>

                        <Button
                          className="w-full text-lg py-6"
                          onClick={handleDonate}
                          disabled={
                            !donationAmount ||
                            isDonating ||
                            (typeof balance === "number" && Number.parseFloat(donationAmount || "0") > balance) ||
                            !club.evmAddress
                          }
                        >
                          {isDonating ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                              Processing…
                            </>
                          ) : (
                            `Donate ${donationAmount || "0"} HBAR`
                          )}
                        </Button>

                        {!club.evmAddress && (
                          <div className="text-xs text-muted-foreground mt-2">
                            Set <code>NEXT_PUBLIC_DEMO_RECIPIENT_EVM</code> or <code>club.evmAddress</code> to enable sending.
                          </div>
                        )}

                        {/* Receipt */}
                        {lastTransaction && (
                          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center mb-2">
                              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                              <span className="font-medium text-green-800">Donation Successful</span>
                            </div>
                            <div className="text-sm text-green-700 space-y-1">
                              <div>Amount: {lastTransaction.amount} HBAR</div>
                              <div className="flex items-center">
                                Tx Hash:
                                <a
                                  href={hsSearch(lastTransaction.txId)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="ml-1 font-mono text-xs underline underline-offset-2"
                                >
                                  {lastTransaction.txId}
                                </a>
                                <ExternalLink className="w-3 h-3 ml-1" />
                              </div>
                              <div>Time: {new Date(lastTransaction.timestamp).toLocaleString()}</div>
                            </div>
                          </div>
                        )}

                        {/* Badge */}
                        {lastBadge && (
                          <div className="p-4 bg-muted/30 border rounded-lg">
                            <div className="text-sm mb-2">
                              <span className="font-medium">Supporter Badge:</span>{" "}
                              {lastBadge.transferred ? "Delivered to your wallet" : "Waiting to be claimed"}
                            </div>
                            <div className="text-xs text-muted-foreground mb-2">
                              Token: {lastBadge.tokenId} • Serial: {lastBadge.serial}
                            </div>
                            {!lastBadge.transferred && (
                              <div className="space-y-2">
                                <Button size="sm" onClick={handleClaim} disabled={isClaiming}>
                                  {isClaiming ? "Claiming…" : "Claim to my wallet"}
                                </Button>
                                <p className="text-xs text-muted-foreground">
                                  If this fails, open a Hedera wallet (e.g., HashPack) and <strong>associate</strong>{" "}
                                  token <span className="font-mono">{lastBadge.tokenId}</span>, or enable auto-associations.
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Feed + Leaderboard */}
              <div className="lg:col-span-2">
                <Tabs defaultValue="feed" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="feed" className="flex items-center">
                      <Activity className="w-4 h-4 mr-2" />
                      Live Feed
                      {realtimeConnected && <div className="w-2 h-2 bg-green-500 rounded-full ml-2 animate-pulse" />}
                    </TabsTrigger>
                    <TabsTrigger value="leaderboard" className="flex items-center">
                      <Trophy className="w-4 h-4 mr-2" />
                      Leaderboard
                    </TabsTrigger>
                  </TabsList>

                  {/* Feed */}
                  <TabsContent value="feed" className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>Recent Donations</span>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <div className={`w-2 h-2 rounded-full mr-2 ${realtimeConnected ? "bg-green-500 animate-pulse" : "bg-gray-400"}`} />
                            {realtimeConnected ? "Live" : "Offline"}
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {clubDonations.length > 0 ? (
                            clubDonations.map((d, idx) => (
                              <div
                                key={`${d.txId || d.timestamp}-${idx}`}
                                className="flex items-center justify-between p-4 bg-muted/50 rounded-lg animate-in slide-in-from-top-2 duration-300"
                              >
                                <div className="flex items-center space-x-3">
                                  <Avatar className="w-10 h-10">
                                    <AvatarFallback className="bg-primary/10 text-primary">{d.fanId.slice(-2)}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium">{d.fanId}</div>
                                    <div className="text-sm text-muted-foreground flex items-center">
                                      <Clock className="w-3 h-3 mr-1" />
                                      {d.timestamp}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold text-primary">{d.amount} HBAR</div>
                                  {d.txId && (
                                    <a
                                      className="text-xs text-muted-foreground font-mono underline underline-offset-2"
                                      href={hsSearch(d.txId)}
                                      target="_blank"
                                      rel="noreferrer"
                                    >
                                      {d.txId.slice(0, 12)}…
                                    </a>
                                  )}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-8 text-muted-foreground">
                              <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                              <p>No recent donations. Be the first to support this club</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Leaderboard */}
                  <TabsContent value="leaderboard" className="mt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
                            Top Donors
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {(lb?.topDonors || []).map((d: any, i: number) => (
                              <div key={`${d.accountId}-${i}`} className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                      i === 0 ? "bg-yellow-100 text-yellow-800"
                                      : i === 1 ? "bg-gray-100 text-gray-800"
                                      : i === 2 ? "bg-orange-100 text-orange-800"
                                      : "bg-muted text-muted-foreground"
                                    }`}
                                  >
                                    {i + 1}
                                  </div>
                                  <div>
                                    <div className="font-medium">
                                      {d.evmAddress ? `${d.evmAddress.slice(0, 6)}…${d.evmAddress.slice(-4)}` : d.accountId}
                                    </div>
                                    <div className="text-xs text-muted-foreground">{d.donations} donations</div>
                                  </div>
                                </div>
                                <div className="font-bold text-primary">{d.totalHBAR.toLocaleString()} HBAR</div>
                              </div>
                            ))}
                            {lbLoading && <div className="text-sm text-muted-foreground">Loading leaderboard…</div>}
                            {!lbLoading && (!lb?.topDonors || lb.topDonors.length === 0) && (
                              <div className="text-sm text-muted-foreground">No donors yet</div>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader><CardTitle>Club Statistics</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Total Raised</span>
                            <span className="font-bold text-lg text-primary">
                              {(lb?.totalRaisedHBAR ?? club.totalRaised).toLocaleString()} HBAR
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Total Supporters</span>
                            <span className="font-bold">{club.supporters.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Average Donation</span>
                            <span className="font-bold">
                              {Math.round((lb?.totalRaisedHBAR ?? club.totalRaised) / Math.max(1, club.supporters))} HBAR
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Recent Donations</span>
                            <span className="font-bold">{(lb?.recent || []).length}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

// ---------------------------------------------------------------------
// Small utility
// ---------------------------------------------------------------------
function relativeTime(ts: string) {
  const now = new Date();
  const time = new Date(ts);
  const diff = Math.floor((now.getTime() - time.getTime()) / 1000);
  if (diff < 60) return `${diff} seconds ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  return `${Math.floor(diff / 86400)} days ago`;
}
