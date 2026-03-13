# On-Chain Setup Guide (IPFS + Stellar NFT)

This guide walks you through enabling the IPFS storage and Stellar NFT minting pipeline for Mycelium observations.

## Architecture Overview

```
User submits observation
  → Photos uploaded to IPFS (Pinata)
  → Metadata JSON uploaded to IPFS (references photo CIDs)
  → NFT mint transaction built (server signs as issuer)
  → User co-signs with Freighter wallet
  → Transaction submitted to Stellar Horizon
  → Observation stored on-chain as a 1-of-1 asset with IPFS CID in manage_data
```

## Prerequisites

- [Freighter wallet](https://www.freighter.app/) browser extension installed
- A [Pinata](https://app.pinata.cloud) account (free tier works)
- A Stellar keypair for the NFT issuer account

---

## Step 1: Pinata (IPFS)

1. Go to [app.pinata.cloud](https://app.pinata.cloud) and sign up
2. Navigate to **API Keys** and create a new key with `pinFileToIPFS` and `pinJSONToIPFS` permissions
3. Copy the **API Key** and **Secret Key**

## Step 2: Stellar Issuer Account

The issuer is a dedicated Stellar account that mints observation NFTs. Each observation becomes a unique asset (e.g., `MYC00001AB`) issued by this account.

### Testnet

1. Go to [Stellar Laboratory](https://laboratory.stellar.org/#account-creator?network=test)
2. Click **Generate Keypair** — save both the **Public Key** and **Secret Key**
3. Click **Fund account on test network** (uses Friendbot) to add testnet XLM

### Mainnet (later)

Same process but fund the account with real XLM. Start with testnet.

## Step 3: Create `.env.local`

In the `mycelium/` directory, create a `.env.local` file:

```env
# IPFS — Pinata
PINATA_API_KEY=your_api_key_here
PINATA_SECRET_KEY=your_secret_key_here

# Stellar
NEXT_PUBLIC_STELLAR_NETWORK=testnet
STELLAR_ISSUER_SECRET=your_issuer_secret_key_here
```

> **Never commit `.env.local` to git.** It's already in `.gitignore` by default in Next.js.

## Step 4: Freighter Configuration

1. Install [Freighter](https://www.freighter.app/) in your browser
2. Create or import a Stellar account
3. **Switch to Test Net** in Freighter settings (for testnet development)
4. Fund your Freighter account on testnet: visit `https://friendbot.stellar.org?addr=YOUR_FREIGHTER_PUBLIC_KEY`

## Step 5: Test the Flow

1. Start the dev server: `npm run dev`
2. Connect your Freighter wallet in the app
3. Create a new observation with at least one photo
4. On the last step (ID & Notes), check **"Publish on-chain"**
5. Submit — you should see:
   - "Uploading to IPFS..." → photos and metadata pinned to Pinata
   - "Building NFT transaction..." → server creates the mint tx
   - "Waiting for Freighter signature..." → Freighter popup asks you to sign
   - After signing, the transaction is submitted to Stellar Horizon

## Step 6: Verify

### IPFS

Check your uploads at [app.pinata.cloud](https://app.pinata.cloud) → **Pin Manager**. You should see:
- `mycelium-photo-*` — the uploaded images
- `mycelium-obs-*` — the metadata JSON

View any pin at `https://gateway.pinata.cloud/ipfs/{CID}`

### Stellar

Check the transaction on [Stellar Expert](https://stellar.expert/explorer/testnet):
- Search for your issuer public key
- You should see the new asset, payment, and manage_data operations
- The `manage_data` entry `ipfs:MYCxxxxxxx` contains the IPFS metadata CID

---

## How It Works (Technical)

### IPFS Flow

| File | Role |
|---|---|
| `lib/ipfs/client.ts` | Pinata API wrapper: `uploadFile()`, `uploadJSON()`, `buildObservationMetadata()` |
| `app/api/ipfs/upload/route.ts` | POST endpoint — receives photos + metadata, pins to IPFS, returns CIDs |

### Stellar NFT Flow

| File | Role |
|---|---|
| `lib/stellar/nft.ts` | Builds a Stellar transaction that: (1) observer trusts the new asset, (2) issuer sends 1 unit, (3) stores IPFS CID via `manage_data` |
| `app/api/nft/mint/route.ts` | POST endpoint — builds and issuer-signs the transaction, returns XDR for Freighter co-signing |

### Client-Side Orchestration

| File | Role |
|---|---|
| `hooks/usePublishObservation.ts` | Orchestrates the full flow: IPFS upload → NFT tx build → Freighter sign → Horizon submit |
| `components/observation/ObservationForm.tsx` | "Publish on-chain" checkbox + status indicator on the last form step |

### Graceful Degradation

- If Pinata keys are not set → IPFS upload is skipped, observation saves normally
- If Stellar keys are not set → NFT minting is skipped
- If Freighter rejects the signature → IPFS data is kept, NFT is skipped
- If any step fails → error shown in the form, observation is still saved locally

---

## Troubleshooting

**"IPFS not configured"** — Check that `PINATA_API_KEY` and `PINATA_SECRET_KEY` are set in `.env.local` and restart the dev server.

**"Stellar NFT minting not configured"** — Check that `STELLAR_ISSUER_SECRET` and `NEXT_PUBLIC_STELLAR_NETWORK` are set.

**Freighter not popping up** — Make sure you're on the correct network (testnet vs public) in both Freighter settings and `.env.local`.

**"op_no_trust" error** — The observer's account doesn't trust the asset yet. This should be handled automatically by the `changeTrust` operation in the transaction, but make sure the observer account is funded with enough XLM (minimum balance + trustline reserve = ~1.5 XLM).

**"op_underfunded" on issuer** — The issuer account needs XLM for transaction fees and reserve. Fund it via Friendbot (testnet) or send XLM (mainnet).
