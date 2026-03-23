import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { apiGuard, userRateLimit } from "@/lib/api-guard";
import { encryptSecret } from "@/lib/stellar/wallet-crypto";
import * as StellarSdk from "@stellar/stellar-sdk";

// 3 wallet creations per hour per IP (should only ever be called once per user)
const GUARD_CONFIG = { limit: 3, windowSeconds: 3600, route: "wallet-create" };

export async function POST(request: Request) {
  const guard = apiGuard(request, GUARD_CONFIG);
  if (guard.blocked) return guard.response;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const userLimit = userRateLimit(user.id, "wallet-create", 3, 3600);
  if (userLimit.blocked) return userLimit.response;

  const admin = createAdminClient();

  try {
    // Check if wallet already exists
    const { data: existing } = await admin
      .from("stellar_wallets")
      .select("public_key")
      .eq("user_id", user.id)
      .single();

    if (existing) {
      return NextResponse.json({ address: existing.public_key, alreadyExists: true });
    }

    // Generate keypair
    const keypair = StellarSdk.Keypair.random();
    const publicKey = keypair.publicKey();
    const secret = keypair.secret();

    // Encrypt and store
    const encryptedSecret = encryptSecret(secret);

    await admin.from("stellar_wallets").insert({
      user_id: user.id,
      public_key: publicKey,
      encrypted_secret: encryptedSecret,
      funded: false,
    });

    // Update profile with public address
    await admin
      .from("profiles")
      .update({ stellar_address: publicKey, stellar_public_key: publicKey })
      .eq("id", user.id);

    // Fund on testnet via friendbot
    const network = process.env.NEXT_PUBLIC_STELLAR_NETWORK ?? "testnet";
    if (network === "testnet") {
      try {
        await fetch(
          `https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`
        );
        await admin
          .from("stellar_wallets")
          .update({ funded: true })
          .eq("user_id", user.id);
      } catch (fundErr) {
        // Non-fatal: account created but not yet funded
        console.error("Friendbot funding failed:", fundErr);
      }
    }

    return NextResponse.json({ address: publicKey, alreadyExists: false });
  } catch (error) {
    console.error("Wallet creation error:", error);
    return NextResponse.json({ error: "Wallet creation failed" }, { status: 500 });
  }
}
