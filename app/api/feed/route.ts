import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongo";
import Donation from "@/models/Donation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const clubId = searchParams.get("clubId") || undefined;
  const evm = (searchParams.get("evm") || undefined)?.toLowerCase();

  await dbConnect();

  const match: any = {};
  if (clubId) match.clubId = String(clubId);
  if (evm) match.destEvm = evm;

  const items = await Donation.find(match).sort({ timestamp: -1 }).limit(20).lean();

  return NextResponse.json({
    items: items.map((d) => ({
      id: String(d._id),
      clubId: d.clubId,
      clubName: d.clubName,
      fanId: `Fan#${d.donorEvm.slice(-4)}`,
      amount: d.amountHBAR,
      txId: d.txHash,
      timestamp: d.timestamp?.toISOString?.() || new Date().toISOString(),
    })),
  });
}
