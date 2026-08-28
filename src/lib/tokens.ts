import "server-only";
import { randomBytes, createHash } from "crypto";

/**
 * Generates a URL-safe random token. The raw token is emailed to the user;
 * only its SHA-256 hash is stored in the database so a database leak does
 * not expose live tokens.
 */
export function generateToken(): { raw: string; hashed: string } {
  const raw = randomBytes(32).toString("base64url");
  return { raw, hashed: hashToken(raw) };
}

export function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}
