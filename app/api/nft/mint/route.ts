import { NextRequest, NextResponse } from "next/server";
import {
  AccountId, Client, NftId, PrivateKey,
  TokenCreateTransaction, TokenId, TokenMintTransaction,
  TokenSupplyType, TokenType, TransferTransaction
} from "@hashgraph/sdk";

const NET = (process.env.HEDERA_NETWORK || "testnet") as "testnet" | "mainnet" | "previewnet";
const OP_ID = process.env.HEDERA_OPERATOR_ID!;
const OP_KEY_RAW = process.env.HEDERA_OPERATOR_KEY!;
const MIRROR = process.env.MIRROR_BASE || "https://testnet.mirrornode.hedera.com";

const TIER1_META = process.env.NFT_TIER1_META; // < 50
const TIER2_META = process.env.NFT_TIER2_META; // 50-300
const TIER3_META = process.env.NFT_TIER3_META; // > 300

let CACHED_TOKEN_ID: TokenId | null = process.env.HEDERA_NFT_TOKEN_ID
  ? TokenId.fromString(process.env.HEDERA_NFT_TOKEN_ID)
  : null;

function keyFromEnv(): PrivateKey {
  const k = OP_KEY_RAW.trim();
  try {
    if (k.startsWith("302e") || k.startsWith("302d")) return PrivateKey.fromStringDer(k);
    if (k.startsWith("0x")) { try { return PrivateKey.fromStringECDSA(k); } catch {} return PrivateKey.fromStringED25519(k); }
    return PrivateKey.fromString(k);
  } catch {
    throw new Error("Invalid operator private key format");
  }
}

function client() {
  const c = Client.forName(NET);
  c.setOperator(AccountId.fromString(OP_ID), keyFromEnv());
  return c;
}

type Tier = "BRONZE" | "SILVER" | "GOLD";

function pickTier(amountHBAR?: number): Tier {
  const a = Number(amountHBAR || 0);
  if (a > 300) return "GOLD";
  if (a >= 50) return "SILVER";
  return "BRONZE";
}

function tierMetaUri(tier: Tier): string {
  if (tier === "GOLD" && TIER3_META) return TIER3_META;
  if (tier === "SILVER" && TIER2_META) return TIER2_META;
  if (tier === "BRONZE" && TIER1_META) return TIER1_META;
  // Safety fallback – still a valid small payload, but wallets won't have an image.
  return "ipfs://metadata-missing";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const donorEvm: string | undefined = body?.donorEvm;
    const clubId: string | undefined = body?.clubId;
    const amountHBAR: number | undefined = body?.amountHBAR;
    const txHash: string | undefined = body?.txHash;

    console.log("[nft] request:", { donorEvm, clubId, amountHBAR, txHash });
    if (!donorEvm) return NextResponse.json({ error: "donorEvm is required" }, { status: 400 });

    // Resolve donor EVM -> Hedera account
    const donorAccount = await evmToAccount(donorEvm);
    if (!donorAccount) return NextResponse.json({ error: "Donor account not found on mirror" }, { status: 404 });
    console.log("[nft] donor account:", donorAccount);

    const tokenId = await ensureToken();
    console.log("[nft] using collection:", tokenId.toString());

    // ---- Tiered metadata (image JSON on IPFS) ----
    const tier = pickTier(amountHBAR);
    const metaUri = tierMetaUri(tier); // e.g. "ipfs://bafy..."
    const metaBytes = Buffer.from(metaUri); // <=100 bytes OK

    const c = client();
    const opPriv = keyFromEnv();

    const mintTx = await new TokenMintTransaction()
      .setTokenId(tokenId)
      .setMetadata([metaBytes])
      .freezeWith(c)
      .sign(opPriv);

    const mintRx = await (await mintTx.execute(c)).getReceipt(c);
    const serial = mintRx.serials?.[0]?.toNumber();
    if (!serial) return NextResponse.json({ error: "Mint did not return a serial" }, { status: 500 });

    // If donor == treasury, skip transfer
    if (donorAccount === OP_ID) {
      return NextResponse.json({
        tokenId: tokenId.toString(), serial, transferred: true, donorAccount,
        tier, note: "Donor is the treasury. NFT already in your wallet."
      });
    }

    let transferred = false;
    let transferError: string | undefined;
    try {
      const xfer = await new TransferTransaction()
        .addNftTransfer(new NftId(tokenId, serial), AccountId.fromString(OP_ID), AccountId.fromString(donorAccount))
        .freezeWith(c)
        .sign(opPriv);
      await (await xfer.execute(c)).getReceipt(c);
      transferred = true;
    } catch (e: any) {
      transferError = e?.message || String(e);
      console.warn("[nft] transfer failed (likely not associated):", transferError);
    }

    return NextResponse.json({
      tokenId: tokenId.toString(),
      serial,
      transferred,
      donorAccount,
      tier,
      metaUri,
      note: transferred
        ? "Badge transferred to donor"
        : "Badge minted in treasury. Donor must associate, then call /api/nft/claim.",
      transferError,
    });
  } catch (e: any) {
    console.error("[nft] ERROR:", e?.message || e);
    return NextResponse.json({ error: e?.message || "mint failed" }, { status: 500 });
  }
}

async function evmToAccount(evm: string): Promise<string | null> {
  try {
    const r = await fetch(`${MIRROR}/api/v1/accounts/${evm}`);
    if (!r.ok) return null;
    const j: any = await r.json();
    return j?.account || null;
  } catch { return null; }
}

async function ensureToken(): Promise<TokenId> {
  if (CACHED_TOKEN_ID) return CACHED_TOKEN_ID;
  if (process.env.HEDERA_NFT_TOKEN_ID) {
    CACHED_TOKEN_ID = TokenId.fromString(process.env.HEDERA_NFT_TOKEN_ID);
    return CACHED_TOKEN_ID;
  }

  console.log("[nft] creating collection…");
  const c = client();
  const opPriv = keyFromEnv();

  const create = await new TokenCreateTransaction()
    .setTokenName("TeamFirst Supporter")
    .setTokenSymbol("TFSUP")
    .setTokenType(TokenType.NonFungibleUnique)
    .setSupplyType(TokenSupplyType.Infinite)
    .setTreasuryAccountId(AccountId.fromString(OP_ID))
    .setSupplyKey(opPriv.publicKey)
    .freezeWith(c)
    .sign(opPriv);

  const rx = await (await create.execute(c)).getReceipt(c);
  if (!rx.tokenId) throw new Error("Token creation failed");
  CACHED_TOKEN_ID = rx.tokenId;
  console.log("[nft] collection created:", CACHED_TOKEN_ID.toString(), "— add HEDERA_NFT_TOKEN_ID to .env for reuse");
  return CACHED_TOKEN_ID;
}
