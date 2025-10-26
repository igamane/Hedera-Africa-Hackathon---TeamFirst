import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongo";
import User from "@/models/User";
import Donation from "@/models/Donation";
import Nft from "@/models/Nft";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const evm = (searchParams.get("evm") || "").toLowerCase();
  if (!evm) return NextResponse.json({ error: "evm required" }, { status: 400 });

  await dbConnect();

  const user = await User.findOne({ evm }).lean();
  const donations = await Donation.find({ donorEvm: evm }).sort({ timestamp: -1 }).limit(100).lean();
  const nfts = await Nft.find({ donorEvm: evm }).sort({ mintedAt: -1 }).lean();

  return NextResponse.json({
    user,
    totals: {
      donationsHBAR: donations.reduce((a, d) => a + (d.amountHBAR || 0), 0),
      donationsCount: donations.length,
      badges: nfts.filter((n) => n.transferred).length,
    },
    donations,
    nfts,
  });
}
