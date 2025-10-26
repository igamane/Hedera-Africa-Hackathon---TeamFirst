import { NextRequest, NextResponse } from "next/server";
import { AccountId, Client, NftId, PrivateKey, TokenId, TransferTransaction } from "@hashgraph/sdk";
import { dbConnect } from "@/lib/mongo";
import Nft from "@/models/Nft";
import User from "@/models/User";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NET = (process.env.HEDERA_NETWORK || "testnet") as "testnet" | "mainnet" | "previewnet";
const OP_ID = process.env.HEDERA_OPERATOR_ID!;
const OP_KEY_RAW = process.env.HEDERA_OPERATOR_KEY!;
const MIRROR = process.env.MIRROR_BASE || "https://testnet.mirrornode.hedera.com";

function keyFromEnv(): PrivateKey {
  const k = OP_KEY_RAW.trim();
  if (k.startsWith("302e") || k.startsWith("302d")) return PrivateKey.fromStringDer(k);
  if (k.startsWith("0x")) { try { return PrivateKey.fromStringECDSA(k); } catch { return PrivateKey.fromStringED25519(k); } }
  return PrivateKey.fromString(k);
}
function client() { const c = Client.forName(NET); c.setOperator(AccountId.fromString(OP_ID), keyFromEnv()); return c; }

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const tokenId = TokenId.fromString(body?.tokenId);
    const serial = Number(body?.serial);
    const donorEvm: string | undefined = body?.donorEvm;
    const donorAccount: string | undefined = body?.donorAccount;

    if (!tokenId || !serial || (!donorEvm && !donorAccount))
      return NextResponse.json({ error: "tokenId, serial, and donorEvm|donorAccount are required" }, { status: 400 });

    const acct = donorAccount || (await evmToAccount((donorEvm as string).toLowerCase()));
    if (!acct) return NextResponse.json({ error: "Donor account not found" }, { status: 404 });
    if (acct === OP_ID) {
      // nothing to move; still mark as transferred in DB for consistency
      await dbConnect();
      await Nft.updateOne({ tokenId: tokenId.toString(), serial }, { $set: { transferred: true, transferAt: new Date() } });
      if (donorEvm) {
        await User.updateOne(
          { evm: donorEvm.toLowerCase() },
          { $addToSet: { badges: { tokenId: tokenId.toString(), serial } } },
          { upsert: true }
        );
      }
      return NextResponse.json({ ok: true, transferred: true, note: "Donor is treasury; nothing to transfer." });
    }

    const c = client();
    const xfer = await new TransferTransaction()
      .addNftTransfer(new NftId(tokenId, serial), AccountId.fromString(OP_ID), AccountId.fromString(acct))
      .freezeWith(c)
      .sign(keyFromEnv());

    const rx = await (await xfer.execute(c)).getReceipt(c);

    // ---- persist claim success ----
    await dbConnect();
    await Nft.updateOne(
      { tokenId: tokenId.toString(), serial },
      { $set: { transferred: true, transferAt: new Date() } }
    );
    if (donorEvm) {
      await User.updateOne(
        { evm: donorEvm.toLowerCase() },
        { $addToSet: { badges: { tokenId: tokenId.toString(), serial } } },
        { upsert: true }
      );
    }

    return NextResponse.json({ ok: true, status: rx.status.toString(), transferred: true });
  } catch (e: any) {
    const msg = e?.message || String(e);
    console.error("[nft claim] ERROR:", msg);
    if (msg.includes("TOKEN_NOT_ASSOCIATED")) {
      return NextResponse.json({ error: "TOKEN_NOT_ASSOCIATED: enable auto-association in HashPack or associate this token manually." }, { status: 409 });
    }
    if (msg.includes("ACCOUNT_REPEATED_IN_ACCOUNT_AMOUNTS")) {
      return NextResponse.json({ error: "Source and destination are the same account. Use a different donor account." }, { status: 409 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
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
