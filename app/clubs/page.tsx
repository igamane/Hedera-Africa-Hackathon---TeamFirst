"use client"

import "flag-icons/css/flag-icons.min.css" // <-- flag-icons CSS

import { useState, useMemo } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, TrendingUp, Globe2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

// ---------------------------------------------------------------------
// Mock data (KEEP YOUR CURRENT LONG ARRAY; omitted here for brevity)
// ---------------------------------------------------------------------
const mockClubs = [
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
]

// ---------------------------------------------------------------------
// Helpers: country -> ISO2 for flag-icons (all countries in mockClubs)
// ---------------------------------------------------------------------
const COUNTRY_ISO2: Record<string, string> = {
  Morocco: "ma",
  Egypt: "eg",
  Senegal: "sn",
  "Côte d’Ivoire": "ci",
  "South Africa": "za",
  Cameroon: "cm",
  Mali: "ml",
  Nigeria: "ng",
  Algeria: "dz",
  Tunisia: "tn",
}
const flagClass = (country?: string) =>
  `fi fis fi-${country && COUNTRY_ISO2[country] ? COUNTRY_ISO2[country] : "un"}`
//  - "fi"  : base flag style
//  - "fis" : square variant (looks good in chips/badges)
//  - "fi-xx": ISO code (fallback to UN flag if missing)

// ---------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------
export default function ClubsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCountry, setSelectedCountry] = useState<string>("All")
  const [sortBy, setSortBy] = useState<"totalRaised" | "supporters" | "name">(
    "totalRaised",
  )

  // Country chips: Morocco first, Egypt second, then others A–Z
  const countryChips = useMemo(() => {
    const unique = Array.from(new Set(mockClubs.map((c) => c.country))).sort()
    const ordered = [
      "Morocco",
      "Egypt",
      ...unique.filter((c) => c !== "Morocco" && c !== "Egypt"),
    ]
    return ["All", ...ordered]
  }, [])

  const filteredAndSortedClubs = useMemo(() => {
    const matches = mockClubs.filter((club) => {
      const s = searchTerm.toLowerCase()
      const matchesSearch =
        club.name.toLowerCase().includes(s) ||
        club.location.toLowerCase().includes(s)
      const matchesCountry =
        selectedCountry === "All" || club.country === selectedCountry
      return matchesSearch && matchesCountry
    })

    // Priority: Morocco first, Egypt second, then the rest
    const countryPriority = (country: string) =>
      country === "Morocco" ? 0 : country === "Egypt" ? 1 : 2

    return matches.sort((a, b) => {
      const pa = countryPriority(a.country)
      const pb = countryPriority(b.country)
      if (pa !== pb) return pa - pb

      if (sortBy === "totalRaised") return b.totalRaised - a.totalRaised
      if (sortBy === "supporters") return b.supporters - a.supporters
      if (sortBy === "name") return a.name.localeCompare(b.name)
      return 0
    })
  }, [searchTerm, selectedCountry, sortBy])

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1">
        {/* Header Section */}
        <section className="bg-gradient-to-r from-primary/10 via-background to-secondary/10 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                African Football Clubs
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Discover and support football clubs from around Africa
              </p>
            </div>

            {/* Search and Sort */}
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col lg:flex-row gap-4 mb-6">
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search clubs by name or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>

                {/* Sort Dropdown */}
                <div className="flex gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) =>
                      setSortBy(e.target.value as "totalRaised" | "supporters" | "name")
                    }
                    className="px-4 py-3 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="totalRaised">Sort by Donations</option>
                    <option value="supporters">Sort by Supporters</option>
                    <option value="name">Sort by Name</option>
                  </select>
                </div>
              </div>

              {/* Country Filter */}
              <div className="flex flex-wrap gap-2 justify-center">
                {countryChips.map((country) => (
                  <Button
                    key={country}
                    variant={selectedCountry === country ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCountry(country)}
                    className="transition-all normal-case"
                  >
                    {country === "All" ? (
                      <Globe2 className="w-4 h-4 mr-2" />
                    ) : (
                      <span
                        className={`${flagClass(
                          country,
                        )} mr-2`}
                        aria-hidden
                      />
                    )}
                    {country}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Clubs Grid */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Results Summary */}
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-semibold">
                {filteredAndSortedClubs.length} Club
                {filteredAndSortedClubs.length !== 1 ? "s" : ""} Found
              </h2>
              <div className="text-sm text-muted-foreground">
                Total raised:{" "}
                {filteredAndSortedClubs
                  .reduce((sum, club) => sum + club.totalRaised, 0)
                  .toLocaleString()}{" "}
                HBAR
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedClubs.map((club) => (
                <Link key={club.id} href={`/clubs/${club.id}`}>
                  <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                    <CardHeader className="pb-4">
                      <div className="flex items-center space-x-4">
                        <div className="relative w-16 h-16 rounded-full overflow-hidden bg-muted flex-shrink-0">
                          <Image
                            src={club.logo || "/placeholder.svg"}
                            alt={`${club.name} logo`}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg group-hover:text-primary transition-colors truncate">
                            {club.name}
                          </h3>
                          <div className="flex items-center text-sm text-muted-foreground mt-1">
                            <MapPin className="w-3 h-3 mr-1" />
                            {club.location}
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {club.bio}
                      </p>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Total Raised</span>
                          <div className="flex items-center text-primary font-bold">
                            <TrendingUp className="w-4 h-4 mr-1" />
                            {club.totalRaised.toLocaleString()} HBAR
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Supporters</span>
                          <span className="text-sm font-semibold">
                            {club.supporters.toLocaleString()}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="text-xs">
                            <span className={`${flagClass(club.country)} mr-1`} />
                            {club.country}
                          </Badge>

                          <Button
                            size="sm"
                            className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                          >
                            Donate Now
                          </Button>
                        </div>

                        {/* Optional subtle league/category line */}
                        <div className="text-xs text-muted-foreground">
                          {club.category}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* No Results */}
            {filteredAndSortedClubs.length === 0 && (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No clubs found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search terms or filters
                </p>
                <Button
                  onClick={() => {
                    setSearchTerm("")
                    setSelectedCountry("All")
                  }}
                  variant="outline"
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
