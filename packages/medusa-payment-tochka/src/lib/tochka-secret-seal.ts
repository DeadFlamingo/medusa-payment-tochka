import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto"

import type { StoredTochkaOptions } from "./tochka-options"

export const TOCHKA_SEAL_PREFIX = "enc:v1:"

export function resolveTochkaSealSecret(
  env: NodeJS.ProcessEnv = process.env
): string {
  return (env.TOCHKA_SECRETS_KEY || env.JWT_SECRET || "").trim()
}

function keyFromSecret(secret: string): Buffer {
  return createHash("sha256").update(secret, "utf8").digest()
}

export function isSealedTochkaSecret(value: unknown): value is string {
  return typeof value === "string" && value.startsWith(TOCHKA_SEAL_PREFIX)
}

export function sealTochkaSecret(plaintext: string, secret: string): string {
  const trimmed = plaintext.trim()
  if (!trimmed || !secret || isSealedTochkaSecret(trimmed)) {
    return plaintext
  }

  const iv = randomBytes(12)
  const cipher = createCipheriv("aes-256-gcm", keyFromSecret(secret), iv)
  const encrypted = Buffer.concat([
    cipher.update(trimmed, "utf8"),
    cipher.final(),
  ])
  const payload = Buffer.concat([iv, cipher.getAuthTag(), encrypted])
  return `${TOCHKA_SEAL_PREFIX}${payload.toString("base64url")}`
}

export function unsealTochkaSecret(value: string, secret: string): string {
  if (!isSealedTochkaSecret(value)) {
    return value
  }

  if (!secret) {
    throw new Error(
      "Cannot decrypt Tochka secrets from store metadata without JWT_SECRET or TOCHKA_SECRETS_KEY."
    )
  }

  const payload = Buffer.from(value.slice(TOCHKA_SEAL_PREFIX.length), "base64url")
  if (payload.length < 29) {
    throw new Error("Stored Tochka secret is corrupted.")
  }

  const iv = payload.subarray(0, 12)
  const tag = payload.subarray(12, 28)
  const encrypted = payload.subarray(28)
  const decipher = createDecipheriv("aes-256-gcm", keyFromSecret(secret), iv)
  decipher.setAuthTag(tag)

  try {
    return Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]).toString("utf8")
  } catch {
    throw new Error("Stored Tochka secret could not be decrypted.")
  }
}

export function sealStoredTochkaSecrets(
  options: StoredTochkaOptions,
  secret: string = resolveTochkaSealSecret()
): StoredTochkaOptions {
  return {
    ...options,
    jwt_token: sealTochkaSecret(options.jwt_token, secret),
    webhook_public_key_json: sealTochkaSecret(
      options.webhook_public_key_json,
      secret
    ),
  }
}

export function hasPlaintextTochkaSecrets(overlay: unknown): boolean {
  if (!overlay || typeof overlay !== "object" || Array.isArray(overlay)) {
    return false
  }

  const stored = overlay as Record<string, unknown>
  return (
    (typeof stored.jwt_token === "string" &&
      stored.jwt_token.trim().length > 0 &&
      !isSealedTochkaSecret(stored.jwt_token)) ||
    (typeof stored.webhook_public_key_json === "string" &&
      stored.webhook_public_key_json.trim().length > 0 &&
      !isSealedTochkaSecret(stored.webhook_public_key_json))
  )
}

export function unsealStoredTochkaSecrets(
  overlay: unknown,
  secret: string = resolveTochkaSealSecret()
): unknown {
  if (!overlay || typeof overlay !== "object" || Array.isArray(overlay)) {
    return overlay
  }

  const patch = overlay as Record<string, unknown>
  return {
    ...patch,
    jwt_token:
      typeof patch.jwt_token === "string"
        ? unsealTochkaSecret(patch.jwt_token, secret)
        : patch.jwt_token,
    webhook_public_key_json:
      typeof patch.webhook_public_key_json === "string"
        ? unsealTochkaSecret(patch.webhook_public_key_json, secret)
        : patch.webhook_public_key_json,
  }
}
