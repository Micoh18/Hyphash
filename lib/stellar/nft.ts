import "server-only";

/**
 * Stellar NFT minting service (custodial).
 *
 * Strategy: Classic Stellar assets as 1-of-1 NFTs.
 * Each observation gets a unique asset code (e.g., "MYC0001") issued from
 * a dedicated issuer account. The issuer mints exactly 1 unit to the
 * observer's custodial wallet, then the IPFS CID is stored on-chain.
 *
 * Both the issuer and observer keys are server-managed.
 * The observer never needs to sign anything manually.
 *
 * Requires:
 * - STELLAR_ISSUER_SECRET env var (issuer account secret key)
 * - NEXT_PUBLIC_STELLAR_NETWORK env var ("testnet" or "public")
 * - WALLET_ENCRYPTION_KEY env var (for decrypting observer keys)
 */

import * as StellarSdk from "@stellar/stellar-sdk";

export function isConfigured(): boolean {
  return !!(process.env.STELLAR_ISSUER_SECRET && process.env.NEXT_PUBLIC_STELLAR_NETWORK);
}

function getNetwork(): { url: string; passphrase: string } {
  const network = process.env.NEXT_PUBLIC_STELLAR_NETWORK ?? "testnet";
  if (network === "public") {
    return {
      url: "https://horizon.stellar.org",
      passphrase: StellarSdk.Networks.PUBLIC,
    };
  }
  return {
    url: "https://horizon-testnet.stellar.org",
    passphrase: StellarSdk.Networks.TESTNET,
  };
}

function getIssuerKeypair(): StellarSdk.Keypair {
  const secret = process.env.STELLAR_ISSUER_SECRET;
  if (!secret) throw new Error("STELLAR_ISSUER_SECRET not set");
  return StellarSdk.Keypair.fromSecret(secret);
}

/**
 * Generate a unique asset code for an observation.
 * Stellar classic assets: max 12 chars alphanumeric.
 * Format: MYC + 9-char hash suffix.
 */
export function generateAssetCode(observationId: string): string {
  let hash = 0;
  for (let i = 0; i < observationId.length; i++) {
    hash = ((hash << 5) - hash + observationId.charCodeAt(i)) | 0;
  }
  const suffix = Math.abs(hash).toString(36).toUpperCase().padStart(9, "0").slice(0, 9);
  return `MYC${suffix}`;
}

/**
 * Build, sign (both sides), and submit the NFT mint transaction.
 * Fully server-side: no client signing needed.
 *
 * Returns the transaction hash and asset code on success.
 */
export async function mintNFT(params: {
  observerAddress: string;
  observerSecret: string;
  observationId: string;
  metadataCid: string;
}): Promise<{
  txHash: string;
  assetCode: string;
  issuerAddress: string;
}> {
  const { url, passphrase } = getNetwork();
  const server = new StellarSdk.Horizon.Server(url);
  const issuerKeypair = getIssuerKeypair();
  const observerKeypair = StellarSdk.Keypair.fromSecret(params.observerSecret);
  const issuerAddress = issuerKeypair.publicKey();

  const assetCode = generateAssetCode(params.observationId);
  const asset = new StellarSdk.Asset(assetCode, issuerAddress);

  const issuerAccount = await server.loadAccount(issuerAddress);

  const transaction = new StellarSdk.TransactionBuilder(issuerAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: passphrase,
  })
    // 1. Observer trusts the asset
    .addOperation(
      StellarSdk.Operation.changeTrust({
        asset,
        source: params.observerAddress,
      })
    )
    // 2. Issuer sends exactly 1 unit to observer
    .addOperation(
      StellarSdk.Operation.payment({
        destination: params.observerAddress,
        asset,
        amount: "1",
      })
    )
    // 3. Store IPFS CID on-chain
    .addOperation(
      StellarSdk.Operation.manageData({
        name: `ipfs:${assetCode}`,
        value: params.metadataCid,
      })
    )
    .setTimeout(300)
    .build();

  // Sign with both keys (fully server-side)
  transaction.sign(issuerKeypair);
  transaction.sign(observerKeypair);

  // Submit to the network
  const result = await server.submitTransaction(transaction);

  return {
    txHash: result.hash,
    assetCode,
    issuerAddress,
  };
}
