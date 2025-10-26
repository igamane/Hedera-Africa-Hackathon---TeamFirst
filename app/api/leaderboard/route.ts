import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongo";
import Donation from "@/models/Donation";

const MIRROR = process.env.MIRROR_BASE || "https://testnet.mirrornode.hedera.com";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const evm = (searchParams.get("evm") || undefined)?.toLowerCase();
    const account = searchParams.get("account") || undefined;
    const clubId = searchParams.get("clubId") || undefined;

    await dbConnect();

    // Prefer DB aggregation (fast, real). Filter by destination.
    const match: any = {};
    if (evm) match.destEvm = evm;
    if (account) match.destAccountId = account;
    if (clubId) match.clubId = clubId;

    const totalAgg = await Donation.aggregate([
      { $match: match },
      { $group: { _id: null, total: { $sum: "$amountHBAR" } } },
    ]);

    const totalRaisedHBAR = totalAgg[0]?.total || 0;

    const topDonors = await Donation.aggregate([
      { $match: match },
      { $group: {
          _id: "$donorEvm",
          totalHBAR: { $sum: "$amountHBAR" },
          donations: { $sum: 1 },
        } },
      { $sort: { totalHBAR: -1 } },
      { $limit: 10 },
      { $project: { accountId: "$_id", evmAddress: "$_id", totalHBAR: 1, donations: 1, _id: 0 } },
    ]);

    const recentDocs = await Donation.find(match).sort({ timestamp: -1 }).limit(20).lean();

    if (topDonors.length || recentDocs.length || totalRaisedHBAR > 0) {
      return NextResponse.json({
        accountId: account,
        evmAddress: evm,
        totalRaisedHBAR,
        topDonors,
        recent: recentDocs.map((d) => ({
          txId: d.txHash,
          from: d.donorEvm,
          to: d.destAccountId || d.destEvm || "unknown",
          amountHBAR: d.amountHBAR,
          consensusAt: d.timestamp?.toISOString?.() || new Date().toISOString(),
        })),
      });
    }

    // ---- Fallback to Mirror Node if DB is empty ----
    const resolved = await resolveAccount(evm, account);
    if (!resolved) return NextResponse.json({ error: "Destination account not found" }, { status: 404 });
    const txs = await fetchTransfersForAccount(resolved.accountId, 200);
    // … (the rest of your original mirror-node aggregation here unchanged)
    // (Keep exactly what you had below this point)
    // --------------------------- mirror-node original START ---------------------------
    const donors = new Map<
      string,
      { accountId: string; totalTinybar: bigint; donations: number; evmAddress?: string }
    >();
    const recent: Array<{ txId: string; from: string; to: string; amountHBAR: number; consensusAt: string }> = [];
    const TINYBAR = 100_000_000n;
    let totalTinybar = 0n;

    for (const t of txs) {
      const transfers: any[] = Array.isArray(t.transfers) ? t.transfers : [];
      if (transfers.length === 0) continue;
      const creditLeg = transfers.find((x) => x.account === resolved.accountId && BigInt(x.amount) > 0n);
      if (!creditLeg) continue;
      const credit = BigInt(creditLeg.amount);
      totalTinybar += credit;

      const donorLeg = transfers
        .filter((x) => x.account !== resolved.accountId && BigInt(x.amount) < 0n)
        .sort((a, b) => Number(BigInt(a.amount) - BigInt(b.amount)))[0];

      const donorId = donorLeg?.account || "unknown";
      recent.push({
        txId: t.transaction_id,
        from: donorId,
        to: resolved.accountId,
        amountHBAR: Number(credit) / Number(TINYBAR),
        consensusAt: t.consensus_timestamp,
      });

      const d = donors.get(donorId) || { accountId: donorId, totalTinybar: 0n, donations: 0, evmAddress: undefined };
      d.totalTinybar += credit; d.donations += 1; donors.set(donorId, d);
    }

    await Promise.all(
      [...donors.values()].map(async (d) => {
        try {
          const r = await fetch(`${MIRROR}/api/v1/accounts/${d.accountId}`);
          if (r.ok) { const j: any = await r.json(); d.evmAddress = j?.evm_address || undefined; }
        } catch {}
      })
    );

    const topDonorsMirror = [...donors.values()]
      .map((d) => ({
        accountId: d.accountId,
        evmAddress: d.evmAddress,
        totalHBAR: Number(d.totalTinybar) / Number(100_000_000n),
        donations: d.donations,
      }))
      .sort((a, b) => b.totalHBAR - a.totalHBAR)
      .slice(0, 10);

    recent.sort((a, b) => (a.consensusAt < b.consensusAt ? 1 : -1));
    const recentLimited = recent.slice(0, 20);

    return NextResponse.json({
      accountId: resolved.accountId,
      evmAddress: resolved.evmAddress?.toLowerCase(),
      totalRaisedHBAR: Number(totalTinybar) / Number(100_000_000n),
      topDonors: topDonorsMirror,
      recent: recentLimited,
    });
    // --------------------------- mirror-node original END ---------------------------
  } catch (e: any) {
    console.error("[leaderboard] ERROR:", e);
    return NextResponse.json({ error: e?.message || "failed" }, { status: 500 });
  }
}

/* mirror helpers from your previous file */
const TINYBAR = 100_000_000n;
async function resolveAccount(evm?: string, account?: string) {
  try {
    if (account) {
      const r = await fetch(`${MIRROR}/api/v1/accounts/${account}`); if (!r.ok) return null;
      const j: any = await r.json(); return { accountId: j.account, evmAddress: j.evm_address || undefined };
    }
    if (evm) {
      const r = await fetch(`${MIRROR}/api/v1/accounts/${evm}`); if (!r.ok) return null;
      const j: any = await r.json(); return { accountId: j.account, evmAddress: j.evm_address || evm };
    }
    return null;
  } catch { return null; }
}
async function fetchTransfersForAccount(accountId: string, want = 100) {
  const base = `${MIRROR}/api/v1/transactions`;
  const items: any[] = [];
  let next: string | null = `${base}?account.id=${accountId}&result=success&order=desc&limit=25`;
  while (next && items.length < want) {
    const r = await fetch(next); if (!r.ok) break;
    const j: any = await r.json();
    const batch = (j.transactions || []).filter((t: any) => Array.isArray(t.transfers));
    items.push(...batch); next = j?.links?.next ? `${MIRROR}${j.links.next}` : null;
  }
  console.log("[leaderboard] fetched tx count:", items.length);
  return items;
}
