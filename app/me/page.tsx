"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import Image from "next/image";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useBalance } from "wagmi";

import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Wallet, History, Award, ExternalLink, Copy, CheckCircle, Trophy,
  Calendar, TrendingUp, AlertCircle,
} from "lucide-react";

const fetcher = (url: string) => fetch(url).then(r => r.json());

// Mirror node + hashscan (default to testnet)
const MIRROR = process.env.NEXT_PUBLIC_MIRROR_NODE || "https://testnet.mirrornode.hedera.com";
const HS_BASE = "https://hashscan.io/#/testnet";
const hsSearch = (q: string) => `${HS_BASE}/search/${encodeURIComponent(q)}`;
const hsToken = (tokenId: string) => `${HS_BASE}/token/${encodeURIComponent(tokenId)}`;

// ---- OPTIONAL: paste your long mockClubs array here to show logos in history ----
// type ClubLite = { id: number; name: string; logo: string };
// const mockClubs: ClubLite[] = [/* PASTE THE SAME ARRAY YOU ALREADY USE */];
const mockClubs: { id: number; name: string; logo: string }[] = [
  // Senegal
  {
    id: 7,
    name: "ASC Jaraaf",
    logo:
      "https://res.cloudinary.com/doaxoti6i/image/upload/v1761503357/S%C3%A9n%C3%A9gal_page-0001_nqlzoj.jpg",
    bio: "Historic Dakar club with multiple Senegal Ligue 1 titles.",
    totalRaised: 18320,
    location: "Dakar, Senegal",
    country: "Senegal",
    category: "Ligue 1 (Senegal)",
    supporters: 920,
  },
  {
    id: 8,
    name: "Teungueth FC",
    logo:
      "https://res.cloudinary.com/doaxoti6i/image/upload/v1761503357/S%C3%A9n%C3%A9gal_page-0002_keyefk.jpg",
    bio: "Rufisque-based club known for strong continental runs.",
    totalRaised: 14650,
    location: "Rufisque, Senegal",
    country: "Senegal",
    category: "Ligue 1 (Senegal)",
    supporters: 740,
  },
  {
    id: 9,
    name: "Génération Foot",
    logo:
      "https://res.cloudinary.com/doaxoti6i/image/upload/v1761503358/S%C3%A9n%C3%A9gal_page-0003_yqbh9j.jpg",
    bio: "Elite academy club famed for player development.",
    totalRaised: 21240,
    location: "Déni Biram Ndao (Dakar), Senegal",
    country: "Senegal",
    category: "Ligue 1 (Senegal)",
    supporters: 1110,
  },
  {
    id: 10,
    name: "Guédiawaye FC",
    logo:
      "https://res.cloudinary.com/doaxoti6i/image/upload/v1761503358/S%C3%A9n%C3%A9gal_page-0004_ccn2sb.jpg",
    bio: "Ambitious club from Guédiawaye in the Dakar region.",
    totalRaised: 12780,
    location: "Guédiawaye, Senegal",
    country: "Senegal",
    category: "Ligue 1 (Senegal)",
    supporters: 630,
  },

  // Morocco
  {
    id: 11,
    name: "Raja Club Athletic",
    logo:
      "https://res.cloudinary.com/doaxoti6i/image/upload/v1761503359/maroc_page-0003_adaazx.jpg",
    bio: "One of Morocco’s giants with a massive fanbase.",
    totalRaised: 51230,
    location: "Casablanca, Morocco",
    country: "Morocco",
    category: "Botola Pro",
    supporters: 3420,
  },
  {
    id: 12,
    name: "Hassania Union Sport Agadir (HUSA)",
    logo:
      "https://res.cloudinary.com/doaxoti6i/image/upload/v1761503358/maroc_page-0002_ikvi0y.jpg",
    bio: "Traditional club from Agadir with passionate support.",
    totalRaised: 23150,
    location: "Agadir, Morocco",
    country: "Morocco",
    category: "Botola Pro",
    supporters: 1200,
  },
  {
    id: 13,
    name: "Ittihad Riadi de Tanger (IR Tanger)",
    logo:
      "https://res.cloudinary.com/doaxoti6i/image/upload/v1761503358/maroc_page-0001_yu8zql.jpg",
    bio: "Northern powerhouse representing the city of Tangier.",
    totalRaised: 26400,
    location: "Tangier, Morocco",
    country: "Morocco",
    category: "Botola Pro",
    supporters: 1380,
  },
  {
    id: 14,
    name: "Maghreb de Fès (MAS Fes)",
    logo:
      "https://res.cloudinary.com/doaxoti6i/image/upload/v1761503358/maroc_page-0004_vdcams.jpg",
    bio: "Historic club from Fez with continental pedigree.",
    totalRaised: 24760,
    location: "Fez, Morocco",
    country: "Morocco",
    category: "Botola Pro",
    supporters: 1290,
  },

  // Côte d’Ivoire
  {
    id: 15,
    name: "ASEC Mimosas",
    logo:
      "https://res.cloudinary.com/doaxoti6i/image/upload/v1761503520/C%C3%B4te_d_Ivoire_page-0001_nqbmdx.jpg",
    bio: "Legendary Ivorian club and Africa’s top talent factory.",
    totalRaised: 31200,
    location: "Abidjan, Côte d’Ivoire",
    country: "Côte d’Ivoire",
    category: "Ligue 1 (Ivory Coast)",
    supporters: 1880,
  },
  {
    id: 16,
    name: "Stade d’Abidjan",
    logo:
      "https://res.cloudinary.com/doaxoti6i/image/upload/v1761503520/C%C3%B4te_d_Ivoire_page-0002_dhjmsw.jpg",
    bio: "Historic club from Abidjan with several domestic titles.",
    totalRaised: 17450,
    location: "Abidjan, Côte d’Ivoire",
    country: "Côte d’Ivoire",
    category: "Ligue 1 (Ivory Coast)",
    supporters: 940,
  },
  {
    id: 17,
    name: "Société Omnisports de l’Armée (SOA)",
    logo:
      "https://res.cloudinary.com/doaxoti6i/image/upload/v1761503520/C%C3%B4te_d_Ivoire_page-0003_tiueth.jpg",
    bio: "Military-backed club known for discipline and strength.",
    totalRaised: 19670,
    location: "Yamoussoukro, Côte d’Ivoire",
    country: "Côte d’Ivoire",
    category: "Ligue 1 (Ivory Coast)",
    supporters: 1040,
  },
  {
    id: 18,
    name: "Sporting Club de Gagnoa",
    logo:
      "https://res.cloudinary.com/doaxoti6i/image/upload/v1761503521/C%C3%B4te_d_Ivoire_page-0004_fqocls.jpg",
    bio: "Proud club from Gagnoa with a strong regional following.",
    totalRaised: 15340,
    location: "Gagnoa, Côte d’Ivoire",
    country: "Côte d’Ivoire",
    category: "Ligue 1 (Ivory Coast)",
    supporters: 870,
  },

  // South Africa
  {
    id: 19,
    name: "Kaizer Chiefs",
    logo:
      "https://res.cloudinary.com/doaxoti6i/image/upload/v1761503595/South_Africa_page-0001_cegv2r.jpg",
    bio: "One of Africa’s most popular and decorated football clubs.",
    totalRaised: 58900,
    location: "Johannesburg, South Africa",
    country: "South Africa",
    category: "Premier Soccer League",
    supporters: 4020,
  },
  {
    id: 20,
    name: "Mamelodi Sundowns",
    logo:
      "https://res.cloudinary.com/doaxoti6i/image/upload/v1761503595/South_Africa_page-0002_v6x5zo.jpg",
    bio: "The Brazilians – modern African powerhouse club.",
    totalRaised: 62350,
    location: "Pretoria, South Africa",
    country: "South Africa",
    category: "Premier Soccer League",
    supporters: 4210,
  },
  {
    id: 21,
    name: "Bloemfontein Celtic (Siwelele FC)",
    logo:
      "https://res.cloudinary.com/doaxoti6i/image/upload/v1761503596/South_Africa_page-0003_u1o3wc.jpg",
    bio: "Club famous for passionate fans and green colors.",
    totalRaised: 21980,
    location: "Bloemfontein, South Africa",
    country: "South Africa",
    category: "Premier Soccer League",
    supporters: 1410,
  },
  {
    id: 22,
    name: "Orlando Pirates",
    logo:
      "https://res.cloudinary.com/doaxoti6i/image/upload/v1761503596/South_Africa_page-0004_zahzrk.jpg",
    bio: "Historic Soweto club and one of South Africa’s giants.",
    totalRaised: 57440,
    location: "Johannesburg, South Africa",
    country: "South Africa",
    category: "Premier Soccer League",
    supporters: 3950,
  },

  // Cameroon
  {
    id: 23,
    name: "Coton Sport FC de Garoua",
    logo:
      "https://res.cloudinary.com/doaxoti6i/image/upload/v1761503743/Cameroon_page-0002_jsx3ox.jpg",
    bio: "Cameroon’s dominant club with multiple Elite One titles and strong CAF performances.",
    totalRaised: 28400,
    location: "Garoua, Cameroon",
    country: "Cameroon",
    category: "Elite One (Cameroon)",
    supporters: 1670,
  },
  {
    id: 24,
    name: "Canon Sportif de Yaoundé",
    logo:
      "https://res.cloudinary.com/doaxoti6i/image/upload/v1761503743/Cameroon_page-0003_tqt6wo.jpg",
    bio: "Historic club from Yaoundé known for its legendary players and continental success.",
    totalRaised: 26150,
    location: "Yaoundé, Cameroon",
    country: "Cameroon",
    category: "Elite One (Cameroon)",
    supporters: 1420,
  },
  {
    id: 25,
    name: "Aigle Royal FC",
    logo:
      "https://res.cloudinary.com/doaxoti6i/image/upload/v1761503744/Cameroon_page-0004_ao1zaq.jpg",
    bio: "Rising club symbolized by the eagle, representing ambition and strength.",
    totalRaised: 17890,
    location: "Menoua, Cameroon",
    country: "Cameroon",
    category: "Elite One (Cameroon)",
    supporters: 880,
  },
  {
    id: 26,
    name: "Union Sportive de Douala",
    logo:
      "https://res.cloudinary.com/doaxoti6i/image/upload/v1761503744/Cameroon_page-0001_ois67r.jpg",
    bio: "One of Cameroon’s oldest and most successful clubs, representing Douala.",
    totalRaised: 29520,
    location: "Douala, Cameroon",
    country: "Cameroon",
    category: "Elite One (Cameroon)",
    supporters: 1830,
  },

  // Mali
  {
    id: 27,
    name: "Stade Malien de Sikasso",
    logo:
      "https://res.cloudinary.com/doaxoti6i/image/upload/v1761503800/Mali_page-0001_k2mmah.jpg",
    bio: "Competitive club from Sikasso known for its consistent league performances.",
    totalRaised: 15260,
    location: "Sikasso, Mali",
    country: "Mali",
    category: "Ligue 1 (Mali)",
    supporters: 870,
  },
  {
    id: 28,
    name: "Djoliba AC",
    logo:
      "https://res.cloudinary.com/doaxoti6i/image/upload/v1761503800/Mali_page-0002_okmqh1.jpg",
    bio: "One of Mali’s biggest clubs with a long history of domestic dominance.",
    totalRaised: 28750,
    location: "Bamako, Mali",
    country: "Mali",
    category: "Ligue 1 (Mali)",
    supporters: 1650,
  },
  {
    id: 29,
    name: "AS Real Bamako",
    logo:
      "https://res.cloudinary.com/doaxoti6i/image/upload/v1761503800/Mali_page-0003_f3ajri.jpg",
    bio: "Historic Bamako club known for its fierce rivalry with Djoliba AC.",
    totalRaised: 25460,
    location: "Bamako, Mali",
    country: "Mali",
    category: "Ligue 1 (Mali)",
    supporters: 1520,
  },
  {
    id: 30,
    name: "Stade Malien de Bamako",
    logo:
      "https://res.cloudinary.com/doaxoti6i/image/upload/v1761503801/Mali_page-0004_hsyjpf.jpg",
    bio: "Mali’s most decorated club with multiple league and CAF titles.",
    totalRaised: 31280,
    location: "Bamako, Mali",
    country: "Mali",
    category: "Ligue 1 (Mali)",
    supporters: 1910,
  },

  // Egypt
  {
    id: 31,
    name: "Al Ahly SC",
    logo:
      "https://res.cloudinary.com/doaxoti6i/image/upload/v1761503859/Egypt_page-0001_bvkgnm.jpg",
    bio: "Africa’s most decorated club, nicknamed 'The Club of the Century'.",
    totalRaised: 87200,
    location: "Cairo, Egypt",
    country: "Egypt",
    category: "Egyptian Premier League",
    supporters: 5120,
  },
  {
    id: 32,
    name: "Al Masry SC",
    logo:
      "https://res.cloudinary.com/doaxoti6i/image/upload/v1761503860/Egypt_page-0002_t0e8jd.jpg",
    bio: "Port Said’s pride, known for passionate fans and competitive spirit.",
    totalRaised: 29850,
    location: "Port Said, Egypt",
    country: "Egypt",
    category: "Egyptian Premier League",
    supporters: 1710,
  },
  {
    id: 33,
    name: "Zamalek SC",
    logo:
      "https://res.cloudinary.com/doaxoti6i/image/upload/v1761503860/Egypt_page-0003_opzqeb.jpg",
    bio: "Historic rival to Al Ahly with a rich history of continental titles.",
    totalRaised: 78450,
    location: "Cairo, Egypt",
    country: "Egypt",
    category: "Egyptian Premier League",
    supporters: 4780,
  },
  {
    id: 34,
    name: "Ismaily SC",
    logo:
      "https://res.cloudinary.com/doaxoti6i/image/upload/v1761503861/Egypt_page-0004_i5dzrf.jpg",
    bio: "The Yellow Dragons, known for their creative style and loyal base.",
    totalRaised: 35740,
    location: "Ismailia, Egypt",
    country: "Egypt",
    category: "Egyptian Premier League",
    supporters: 2090,
  },

  // Nigeria
  {
    id: 35,
    name: "Enyimba FC",
    logo:
      "https://res.cloudinary.com/doaxoti6i/image/upload/v1761503930/Nigeria_page-0001_xx5sch.jpg",
    bio: "The People’s Elephant, Nigeria’s most successful club in CAF history.",
    totalRaised: 44680,
    location: "Aba, Nigeria",
    country: "Nigeria",
    category: "Nigeria Premier Football League",
    supporters: 2730,
  },
  {
    id: 36,
    name: "Kaduna United FC",
    logo:
      "https://res.cloudinary.com/doaxoti6i/image/upload/v1761503931/Nigeria_page-0002_x2f4ca.jpg",
    bio: "Dynamic team from northern Nigeria, famous for its youth academy.",
    totalRaised: 21640,
    location: "Kaduna, Nigeria",
    country: "Nigeria",
    category: "Nigeria Premier Football League",
    supporters: 1310,
  },
  {
    id: 37,
    name: "Kano Pillars FC",
    logo:
      "https://res.cloudinary.com/doaxoti6i/image/upload/v1761503931/Nigeria_page-0003_n90xwo.jpg",
    bio: "One of Nigeria’s giants, celebrated for its fanbase and league success.",
    totalRaised: 37290,
    location: "Kano, Nigeria",
    country: "Nigeria",
    category: "Nigeria Premier Football League",
    supporters: 2230,
  },
  {
    id: 38,
    name: "Wikki Tourists FC",
    logo:
      "https://res.cloudinary.com/doaxoti6i/image/upload/v1761503933/Nigeria_page-0004_kr961d.jpg",
    bio: "Bauchi’s pride, recognized for its vibrant red-and-yellow colors.",
    totalRaised: 18780,
    location: "Bauchi, Nigeria",
    country: "Nigeria",
    category: "Nigeria Premier Football League",
    supporters: 970,
  },

  // Algeria (IDs continued to keep uniqueness)
  {
    id: 39,
    name: "USM Alger",
    logo:
      "https://res.cloudinary.com/doaxoti6i/image/upload/v1761503972/Alger_page-0001_zdnwtu.jpg",
    bio: "Union Sportive de la Médina d’Alger — multiple-time Algerian champions.",
    totalRaised: 40210,
    location: "Algiers, Algeria",
    category: "Ligue Professionnelle 1 (Algeria)",
    supporters: 3900,
    country: "Algeria",
  },
  {
    id: 40,
    name: "ES Sétif",
    logo:
      "https://res.cloudinary.com/doaxoti6i/image/upload/v1761503973/Alger_page-0002_ou92kj.jpg",
    bio: "Entente Sportive Sétifienne — historic club with continental titles.",
    totalRaised: 35600,
    location: "Sétif, Algeria",
    category: "Ligue Professionnelle 1 (Algeria)",
    supporters: 3400,
    country: "Algeria",
  },
  {
    id: 41,
    name: "CR Belouizdad",
    logo:
      "https://res.cloudinary.com/doaxoti6i/image/upload/v1761503974/Alger_page-0003_b3juta.jpg",
    bio: "Chabab Riadhi de Belouizdad — powerhouse from the Belouizdad district.",
    totalRaised: 33150,
    location: "Algiers, Algeria",
    category: "Ligue Professionnelle 1 (Algeria)",
    supporters: 3200,
    country: "Algeria",
  },
  {
    id: 42,
    name: "JS Kabylie",
    logo:
      "https://res.cloudinary.com/doaxoti6i/image/upload/v1761503973/Alger_page-0004_goho74.jpg",
    bio: "Jeunesse Sportive de Kabylie — one of Algeria’s most decorated clubs.",
    totalRaised: 29800,
    location: "Tizi Ouzou, Algeria",
    category: "Ligue Professionnelle 1 (Algeria)",
    supporters: 2800,
    country: "Algeria",
  },

  // Tunisia
  {
    id: 43,
    name: "Espérance Sportive de Tunis",
    logo:
      "https://res.cloudinary.com/doaxoti6i/image/upload/v1761504029/Tunisie_page-0001_ecjlba.jpg",
    bio: "EST — the Blood & Gold of Tunis, dominant domestically and in Africa.",
    totalRaised: 45200,
    location: "Tunis, Tunisia",
    category: "Ligue Professionnelle 1 (Tunisia)",
    supporters: 5000,
    country: "Tunisia",
  },
  {
    id: 44,
    name: "Club Africain",
    logo:
      "https://res.cloudinary.com/doaxoti6i/image/upload/v1761504029/Tunisie_page-0002_dp5b7f.jpg",
    bio: "Club Africain — historic rivals from the capital city.",
    totalRaised: 38900,
    location: "Tunis, Tunisia",
    category: "Ligue Professionnelle 1 (Tunisia)",
    supporters: 4600,
    country: "Tunisia",
  },
  {
    id: 45,
    name: "Étoile Sportive du Sahel",
    logo:
      "https://res.cloudinary.com/doaxoti6i/image/upload/v1761504030/Tunisie_page-0003_pprkox.jpg",
    bio: "ESS — giants from Sousse with a rich continental record.",
    totalRaised: 36500,
    location: "Sousse, Tunisia",
    category: "Ligue Professionnelle 1 (Tunisia)",
    supporters: 4100,
    country: "Tunisia",
  },
  {
    id: 46,
    name: "Club Sportif Sfaxien",
    logo:
      "https://res.cloudinary.com/doaxoti6i/image/upload/v1761504031/Tunisie_page-0004_xsb07x.jpg",
    bio: "CSS — perennial contenders from the port city of Sfax.",
    totalRaised: 31000,
    location: "Sfax, Tunisia",
    category: "Ligue Professionnelle 1 (Tunisia)",
    supporters: 3600,
    country: "Tunisia",
  },
];
const CLUB_BY_ID = new Map(mockClubs.map(c => [String(c.id), c]));

// --- helpers ---
function ipfsToHttp(uri?: string | null): string | null {
  if (!uri) return null;
  if (uri.startsWith("ipfs://")) return `https://ipfs.io/ipfs/${uri.slice(7)}`;
  // plain CID?
  if (/^[a-zA-Z0-9]+$/.test(uri) && uri.length >= 46) return `https://ipfs.io/ipfs/${uri}`;
  return uri;
}

async function loadNftImage(tokenId: string, serial: number) {
  const res = await fetch(`${MIRROR}/api/v1/tokens/${tokenId}/nfts/${serial}`);
  if (!res.ok) throw new Error(`Mirror node error ${res.status}`);
  const j = await res.json();

  let decoded = "";
  try {
    // Hedera stores NFT metadata as base64-encoded bytes
    decoded = typeof window !== "undefined" ? atob(j.metadata || "") : Buffer.from(j.metadata || "", "base64").toString();
  } catch {
    decoded = "";
  }

  // Many collections store full JSON; some store only a CID or URI
  let img: string | null = null;
  try {
    const meta = JSON.parse(decoded);
    img = meta.image || meta.image_url || meta.imageUrl || null;
  } catch {
    // not JSON -> assume raw CID/URI
    img = decoded || null;
  }
  return { image: ipfsToHttp(img) };
}

// one-card component so we can run a per-NFT SWR safely
function NftCard({
  tokenId, serial, mintedAt, transferred,
}: { tokenId: string; serial: number; mintedAt?: string | Date; transferred?: boolean }) {
  const { data, error, isLoading } = useSWR(
    transferred ? `nftmeta:${tokenId}:${serial}` : null,
    () => loadNftImage(tokenId, serial),
    { revalidateOnFocus: false }
  );

  const img = data?.image || null;

  return (
    <div className={`relative p-4 rounded-lg border-2 transition-all ${transferred ? "border-primary bg-primary/5" : "border-dashed border-muted-foreground/30 bg-muted/30 opacity-70"}`}>
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
          {isLoading ? (
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          ) : img ? (
            // use <img> to avoid Next remote-domain config for IPFS gateways
            <img src={img} alt={`NFT ${tokenId} #${serial}`} className="w-full h-full object-cover" />
          ) : (
            <Trophy className="w-10 h-10 text-primary" />
          )}
        </div>

        <div className="flex-1">
          <div className="font-semibold text-sm">Supporter Badge</div>
          <div className="text-xs text-muted-foreground">Token <a className="underline underline-offset-2" href={hsToken(tokenId)} target="_blank" rel="noreferrer">{tokenId}</a> • Serial #{serial}</div>
          {mintedAt && (
            <div className="text-xs text-muted-foreground mt-1">
              {transferred ? "Delivered" : "Minted"}: {new Date(mintedAt).toLocaleString()}
            </div>
          )}
        </div>
      </div>
      {!transferred && (
        <div className="absolute top-2 right-2">
          <Badge variant="outline" className="text-xs">Unclaimed</Badge>
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const { address, isConnected, isConnecting } = useAccount();
  const { data: balanceData } = useBalance({ address, query: { enabled: !!address } });
  const balance = useMemo(() => (balanceData ? Number(balanceData.formatted) : null), [balanceData]);
  const [copiedTxId, setCopiedTxId] = useState<string | null>(null);

  // avoid hydration mismatch for wallet-driven UI
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const meUrl = isConnected && address ? `/api/me?evm=${address.toLowerCase()}` : null;
  const { data: me } = useSWR(meUrl, fetcher, { refreshInterval: 20000, revalidateOnFocus: false });

  const totals = me?.totals || { donationsHBAR: 0, donationsCount: 0, badges: 0 };
  const donations: Array<any> = Array.isArray(me?.donations) ? me!.donations : [];
  const nfts: Array<any> = Array.isArray(me?.nfts) ? me!.nfts : [];

  const shortAddress = address ? `${address.slice(0, 6)}…${address.slice(-4)}` : null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedTxId(text);
    setTimeout(() => setCopiedTxId(null), 2000);
  };

  const earnedNfts = nfts.filter(n => !!n.transferred);

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1">
        {/* Profile Header */}
        <section className="bg-gradient-to-r from-primary/10 via-background to-secondary/10 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
              <Avatar className="w-24 h-24 lg:w-32 lg:h-32">
                <AvatarFallback className="bg-primary/10 text-primary text-2xl lg:text-4xl font-bold">
                  {(address || "0.0.0").slice(-2)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <h1 className="text-3xl lg:text-4xl font-bold mb-4">My Profile</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="text-center lg:text-left">
                    <div className="text-2xl font-bold text-primary">
                      {totals.donationsHBAR.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">HBAR Donated</div>
                  </div>
                  <div className="text-center lg:text-left">
                    <div className="text-2xl font-bold text-secondary">{totals.donationsCount}</div>
                    <div className="text-sm text-muted-foreground">Total Donations</div>
                  </div>
                  <div className="text-center lg:text-left">
                    <div className="text-2xl font-bold">{earnedNfts.length}</div>
                    <div className="text-sm text-muted-foreground">Badges Earned</div>
                  </div>
                  <div className="text-center lg:text-left">
                    <div className="text-2xl font-bold">{shortAddress || "—"}</div>
                    <div className="text-sm text-muted-foreground">Wallet</div>
                  </div>
                </div>

                {mounted && isConnected && balance !== null && (
                  <div className="flex items-center text-sm">
                    <TrendingUp className="w-4 h-4 mr-2 text-primary" />
                    <span className="font-medium">Current Balance: </span>
                    <span className="font-bold text-primary ml-1">
                      {balance.toLocaleString(undefined, { maximumFractionDigits: 2 })} HBAR
                    </span>
                  </div>
                )}
              </div>

              {mounted && !isConnected && (
                <div className="space-y-3">
                  <ConnectButton />
                  {isConnecting && (
                    <div className="flex items-center text-muted-foreground text-sm">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Connecting…
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Profile Content */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Tabs defaultValue="history" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="history" className="flex items-center">
                  <History className="w-4 h-4 mr-2" />
                  Donation History
                </TabsTrigger>
                <TabsTrigger value="badges" className="flex items-center">
                  <Award className="w-4 h-4 mr-2" />
                  NFT Badges
                </TabsTrigger>
              </TabsList>

              {/* Donation History Tab */}
              <TabsContent value="history" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Recent Donations</span>
                      <Badge variant="secondary">{donations.length} transactions</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {donations.length === 0 ? (
                      <div className="text-sm text-muted-foreground">No donations yet.</div>
                    ) : (
                      <div className="space-y-4">
                        {donations.map((d) => {
                          const meta = CLUB_BY_ID.get(String(d.clubId));
                          const clubName = d.clubName || meta?.name || "Club";
                          const clubLogo = meta?.logo || null;
                          const when = d.timestamp ? new Date(d.timestamp) : null;
                          const tx = d.txHash || "";
                          return (
                            <div key={`${d._id || tx}-${d.amountHBAR}`} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted/50 rounded-lg gap-4">
                              <div className="flex items-center space-x-4">
                                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-muted flex-shrink-0">
                                  {clubLogo ? (
                                    <Image src={clubLogo} alt={`${clubName} logo`} fill className="object-cover" />
                                  ) : (
                                    <Avatar className="w-12 h-12">
                                      <AvatarFallback className="bg-primary/10 text-primary">{(clubName || "C").slice(0, 2)}</AvatarFallback>
                                    </Avatar>
                                  )}
                                </div>
                                <div>
                                  <div className="font-medium">{clubName}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {when ? when.toLocaleString() : ""}
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                <div className="text-right">
                                  <div className="font-bold text-primary text-lg">{d.amountHBAR} HBAR</div>
                                  <div className="flex items-center text-xs text-muted-foreground">
                                    {tx && <span className="font-mono mr-2">{tx.slice(0, 16)}…</span>}
                                    {tx && (
                                      <>
                                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => copyToClipboard(tx)}>
                                          {copiedTxId === tx ? <CheckCircle className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                                        </Button>
                                        <Button asChild variant="ghost" size="sm" className="h-6 w-6 p-0 ml-1">
                                          <a href={hsSearch(tx)} target="_blank" rel="noreferrer">
                                            <ExternalLink className="w-3 h-3" />
                                          </a>
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                </div>
                                <Badge variant="default" className="w-fit">completed</Badge>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* NFT Badges Tab */}
              <TabsContent value="badges" className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader><CardTitle>Badge Collection</CardTitle></CardHeader>
                    <CardContent>
                      {earnedNfts.length === 0 ? (
                        <div className="text-sm text-muted-foreground">No badges yet.</div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {earnedNfts.map((n) => (
                            <NftCard
                              key={`${n.tokenId}-${n.serial}`}
                              tokenId={n.tokenId}
                              serial={n.serial}
                              mintedAt={n.mintedAt}
                              transferred={n.transferred}
                            />
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader><CardTitle>How to receive badges</CardTitle></CardHeader>
                    <CardContent className="space-y-3 text-sm text-muted-foreground">
                      <p>
                        Make donations from your connected wallet. When you cross donation thresholds,
                        the matching <strong>Supporter Badge</strong> NFT is minted and sent to you.
                      </p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li><strong>&lt; 50 HBAR</strong> — Bronze badge</li>
                        <li><strong>50 – 300 HBAR</strong> — Silver badge</li>
                        <li><strong>&gt; 300 HBAR</strong> — Gold badge</li>
                      </ul>
                      <p>You can view your collection on Hashscan or in HashPack under the <em>NFTs</em> tab.</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
