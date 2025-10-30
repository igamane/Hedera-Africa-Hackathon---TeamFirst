# TeamFirst — Hedera-Powered Fan Funding for African Football Clubs

TeamFirst is a Next.js 14 application that lets football fans donate HBAR directly to their favourite African clubs while tracking transparent impact on Hedera. The platform showcases club profiles, real-time donation activity, NFT supporter badges, and admin tooling so organisers can onboard teams quickly during hackathon demos.

![TeamFirst hero illustration](public/og-image.png)

## Table of Contents
- [Core Idea](#core-idea)
- [Feature Highlights](#feature-highlights)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Installation](#installation)
  - [Run the App](#run-the-app)
- [Available Scripts](#available-scripts)
- [Testing Notes](#testing-notes)
- [Deployment](#deployment)
- [Pitch Ready Talking Points](#pitch-ready-talking-points)
- [Roadmap Ideas](#roadmap-ideas)

## Core Idea
- **Problem:** African clubs struggle to accept borderless, transparent contributions from global fanbases.
- **Solution:** Fans connect Hedera wallets, select a club, and send instant, low-fee HBAR donations that are mirrored to Hedera Consensus Service (HCS) for auditable receipts. Clubs receive dashboards, fan leaderboards, and marketing-ready proof of support.
- **Hackathon Fit:** Combines Hedera smart wallet tooling, consensus messaging, and community engagement to deliver a polished MVP in a weekend sprint.

## Feature Highlights
| Area | What it Delivers |
| --- | --- |
| Landing Page | Hero CTA, live platform stats, and wallet onboarding flow with RainbowKit. |
| Club Marketplace | Searchable grid of African clubs with bios, donation totals, supporters, and flags. |
| Club Detail Experience | Donation form wired to wagmi + Hedera EVM RPC, real-time ticker, supporter leaderboard, and badge minting calls. |
| Fan Profile ("/me") | Connected wallet overview, donation history, NFT badges, and quick links to HashScan + Hedera Mirror Node APIs. |
| Admin Console | Guided wizard to register clubs, configure Hedera accounts, HCS topics, and NFT collections for future automation. |
| API Layer | Next.js route handlers for donation feed, leaderboard aggregation, NFT mint/claim, and HCS message submission backed by MongoDB. |
| Real-Time UX | Client context that simulates websocket updates for demos and syncs with API data when available. |

## Architecture
```
Next.js 14 (App Router)
├── UI: Tailwind CSS, shadcn/ui, Radix primitives, Embla carousel
├── Wallets: RainbowKit, wagmi, WalletConnect, HashConnect helper hook
├── Hedera: @hashgraph/sdk for HCS, Hashio RPC for EVM transfers
├── Data: MongoDB via Mongoose models (Donation, User, Nft)
└── Tooling: React Query, SWR, TanStack Query, TypeScript, Zod
```
- **App Shell:** `app/` handles routing with shared navigation/footer components and provider wrappers for Wagmi, RainbowKit, and React Query.
- **Blockchain Services:** `lib/hedera-server.ts` initialises Hedera clients, creates HCS topics, and submits donation receipts. `lib/wagmi.ts` fixes WalletConnect + Hedera Testnet configuration.
- **Persistence:** `lib/mongo.ts` exposes a cached Mongoose connection reused by API routes such as `app/api/feed/route.ts` and `app/api/leaderboard/route.ts`.
- **NFT Utility:** `app/api/nft/mint/route.ts` manages tiered metadata URIs and lazy token creation. `app/api/nft/claim/route.ts` handles fan badge distribution.
- **Real-Time UX:** `lib/real-time-context.tsx` powers optimistic updates, while server routes deliver persisted donation streams.

## Project Structure
```
app/
  page.tsx            # Landing page
  clubs/              # Club marketplace & detail views
  me/                 # Fan profile dashboard
  admin/              # Admin onboarding flow
  api/                # Next.js route handlers (feed, leaderboard, HCS, NFT)
components/           # Reusable UI (navigation, footer, shadcn wrappers)
hooks/                # Hedera wallet utilities, toast helpers
lib/                  # Hedera clients, database, real-time context, wagmi setup
models/               # Mongoose schemas for donations, NFTs, users
public/               # Static assets (logos, OG image)
styles/               # Tailwind configuration
```

## Getting Started
### Prerequisites
- **Node.js** 18+ (Next.js 14 support) and **npm** 9+.
- A **Hedera Testnet** account with Operator ID/Key.
- **MongoDB** instance (Atlas or local) for persisting donations and NFTs.
- **WalletConnect Project ID** for RainbowKit multi-wallet support.

### Environment Variables
Create a `.env.local` (or `.env`) file in the project root. Required keys include:

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | WalletConnect cloud ID used by RainbowKit connectors. |
| `NEXT_PUBLIC_MIRROR_NODE` | Optional. Overrides the Hedera Mirror Node base URL (defaults to testnet). |
| `NEXT_PUBLIC_DEMO_RECIPIENT_EVM` | Optional. EVM address prefilled on club pages for demo payouts. |
| `NEXT_PUBLIC_MINT_BADGE` | Optional flag (`true/false`) to show NFT badge mint button in UI demos. |
| `MONGODB_URI` | Connection string for MongoDB. |
| `MONGODB_DB` | Optional database name (defaults to `teamfirst`). |
| `HEDERA_NETWORK` | `testnet`, `previewnet`, or `mainnet`. Defaults to `testnet` for safety. |
| `HEDERA_OPERATOR_ID` | Operator account used for HCS + NFT transactions. |
| `HEDERA_OPERATOR_KEY` | Private key for the operator account (handles ECDSA and ED25519 formats). |
| `HEDERA_HCS_TOPIC_ID` | Optional. Provide an existing HCS topic ID; otherwise the API route can create one. |
| `HEDERA_NFT_TOKEN_ID` | Optional. Existing NFT collection for supporter badges; API can lazy-create when omitted. |
| `NFT_TIER1_META` / `NFT_TIER2_META` / `NFT_TIER3_META` | Metadata URIs for low/mid/high donation tiers. |
| `MIRROR_BASE` | Optional backend override for Mirror Node REST calls. |

> Tip: keep a `.env.example` handy during the hackathon so teammates can bootstrap quickly.
### Installation
```bash
npm install
```

### Run the App
```bash
npm run dev
```
The development server runs at `http://localhost:3000`. RainbowKit prompts appear once you configure the WalletConnect Project ID and restart.

## Available Scripts
| Command | Description |
| --- | --- |
| `npm run dev` | Start Next.js in development mode with hot reload. |
| `npm run build` | Create an optimized production build. |
| `npm run start` | Serve the production build (`npm run build` first). |
| `npm run lint` | Run Next.js linting (ESLint + TypeScript). |

## Testing Notes
The project currently has no automated tests. For hackathon judging, demo the end-to-end donation flow using Hedera testnet accounts and monitor Mirror Node confirmations in the `/me` dashboard.

## Deployment
1. Run `npm run build` to ensure the app compiles with your environment variables.
2. Deploy to Vercel or any Node-compatible host that supports Next.js App Router.
3. Provision environment variables in the hosting dashboard (Vercel → Project Settings → Environment Variables).
4. Configure MongoDB network access (IP allowlist) and Hedera operator credentials in the deployment environment.

## Pitch Ready Talking Points
- Fans can **see donations settle in real time**, while clubs gain a verifiable audit trail on Hedera.
- **NFT supporter badges** reward contributions and unlock future perks (ticket raffles, merch drops).
- **Admin onboarding** helps club partners configure accounts, HCS topics, and NFT collections without touching code.
- Built with **production-ready tooling** (Next.js, RainbowKit, wagmi, MongoDB) so it can ship beyond the hackathon weekend.

