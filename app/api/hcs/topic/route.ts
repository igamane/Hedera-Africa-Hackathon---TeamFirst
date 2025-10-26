import { NextRequest } from "next/server";
import { ensureTopic } from "@/lib/hedera-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(_req: NextRequest) {
  try {
    const topicId = await ensureTopic(undefined);
    return new Response(JSON.stringify({ ok: true, topicId }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: e?.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
