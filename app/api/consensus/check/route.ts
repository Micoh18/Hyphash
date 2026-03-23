import { NextResponse } from "next/server";
import { checkConsensus, markAsVerified } from "@/lib/consensus";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { apiGuard, userRateLimit } from "@/lib/api-guard";

// 30 consensus checks per minute per IP
const GUARD_CONFIG = { limit: 30, windowSeconds: 60, route: "consensus-check" };

export async function POST(request: Request) {
  const guard = apiGuard(request, GUARD_CONFIG);
  if (guard.blocked) return guard.response;

  // Auth check with user client
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  // User-based rate limit: 30 per minute per user
  const userLimit = userRateLimit(user.id, "consensus-check", 30, 60);
  if (userLimit.blocked) return userLimit.response;

  try {
    const { observationId } = await request.json();

    if (!observationId || typeof observationId !== "string") {
      return NextResponse.json({ error: "Valid observationId required" }, { status: 400 });
    }

    // Admin client for reads/writes that bypass RLS (status transitions)
    const admin = createAdminClient();

    const { data: obs } = await admin
      .from("observations")
      .select("status, observer_id, nft_tx_hash")
      .eq("id", observationId)
      .single();

    if (!obs) {
      return NextResponse.json({ error: "Observation not found" }, { status: 404 });
    }

    if (obs.nft_tx_hash) {
      return NextResponse.json({ consensus: true, alreadyMinted: true });
    }

    const result = await checkConsensus(admin, observationId);

    if (!result.reached) {
      if (result.agreeCount > 0 && obs.status === "unverified") {
        await admin
          .from("observations")
          .update({ status: "discussing", updated_at: new Date().toISOString() })
          .eq("id", observationId);
      }

      return NextResponse.json({
        consensus: false,
        agreeCount: result.agreeCount,
        threshold: 3,
      });
    }

    const species = await markAsVerified(admin, observationId, result.species);

    return NextResponse.json({
      consensus: true,
      alreadyMinted: false,
      species,
    });
  } catch (error) {
    console.error("Consensus check error:", error);
    return NextResponse.json({ error: "Consensus check failed" }, { status: 500 });
  }
}
