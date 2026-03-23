import "server-only";

import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const key = process.env.WALLET_ENCRYPTION_KEY;
  if (!key || key.length < 32) {
    throw new Error("WALLET_ENCRYPTION_KEY must be set (min 32 chars)");
  }
  // Use first 32 bytes as AES-256 key
  return Buffer.from(key.slice(0, 32), "utf-8");
}

/**
 * Encrypt a Stellar secret key.
 * Returns: iv:tag:ciphertext (hex-encoded, colon-separated)
 */
export function encryptSecret(secret: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(secret, "utf-8", "hex");
  encrypted += cipher.final("hex");

  const tag = cipher.getAuthTag();

  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted}`;
}

/**
 * Decrypt a Stellar secret key.
 * Expects: iv:tag:ciphertext (hex-encoded, colon-separated)
 */
export function decryptSecret(encryptedData: string): string {
  const key = getEncryptionKey();
  const [ivHex, tagHex, ciphertext] = encryptedData.split(":");

  if (!ivHex || !tagHex || !ciphertext) {
    throw new Error("Invalid encrypted data format");
  }

  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(ciphertext, "hex", "utf-8");
  decrypted += decipher.final("utf-8");

  return decrypted;
}
