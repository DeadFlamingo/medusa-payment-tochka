import {
  DEFAULT_TOCHKA_OPTIONS,
  mergeStoredTochkaOptions,
  toPublicTochkaOptions,
} from "../tochka-options"
import {
  hasPlaintextTochkaSecrets,
  isSealedTochkaSecret,
  sealStoredTochkaSecrets,
  sealTochkaSecret,
  TOCHKA_SEAL_PREFIX,
  unsealTochkaSecret,
  unsealStoredTochkaSecrets,
} from "../tochka-secret-seal"

const SEAL_SECRET = "test-tochka-seal-secret-at-least-32"

describe("Tochka secret seal", () => {
  it("round-trips a JWT and does not store the plaintext", () => {
    const sealed = sealTochkaSecret("jwt-secret-token", SEAL_SECRET)

    expect(sealed.startsWith(TOCHKA_SEAL_PREFIX)).toBe(true)
    expect(sealed).not.toContain("jwt-secret-token")
    expect(unsealTochkaSecret(sealed, SEAL_SECRET)).toBe("jwt-secret-token")
  })

  it("leaves legacy plaintext secrets readable", () => {
    expect(unsealTochkaSecret("env-jwt-token-value", SEAL_SECRET)).toBe(
      "env-jwt-token-value"
    )
    expect(isSealedTochkaSecret("env-jwt-token-value")).toBe(false)
  })

  it("does not re-encrypt an already sealed value", () => {
    const sealed = sealTochkaSecret("jwt-secret-token", SEAL_SECRET)
    expect(sealTochkaSecret(sealed, SEAL_SECRET)).toBe(sealed)
  })

  it("throws when a sealed secret cannot be decrypted", () => {
    const sealed = sealTochkaSecret("jwt-secret-token", SEAL_SECRET)
    expect(() => unsealTochkaSecret(sealed, "other-secret-value-32-chars!!")).toThrow(
      /could not be decrypted/
    )
  })

  it("decrypts store metadata before merge and keeps Admin responses masked", () => {
    const sealed = sealStoredTochkaSecrets(
      {
        ...DEFAULT_TOCHKA_OPTIONS,
        jwt_token: "admin-jwt-token-value",
        webhook_public_key_json: '{"kty":"RSA"}',
        client_id: "admin-client",
      },
      SEAL_SECRET
    )

    expect(sealed.jwt_token).not.toContain("admin-jwt-token-value")
    expect(JSON.stringify(sealed)).not.toContain("admin-jwt-token-value")
    expect(hasPlaintextTochkaSecrets(sealed)).toBe(false)
    expect(
      hasPlaintextTochkaSecrets({ jwt_token: "admin-jwt-token-value" })
    ).toBe(true)

    const previous = process.env.JWT_SECRET
    process.env.JWT_SECRET = SEAL_SECRET
    try {
      const merged = mergeStoredTochkaOptions(DEFAULT_TOCHKA_OPTIONS, sealed)
      expect(merged.jwt_token).toBe("admin-jwt-token-value")
      expect(merged.webhook_public_key_json).toBe('{"kty":"RSA"}')
      expect(toPublicTochkaOptions(merged).jwt_token).toBe("admin***ue")
    } finally {
      process.env.JWT_SECRET = previous
    }
  })

  it("unseals only secret fields on a stored overlay", () => {
    const sealedJwt = sealTochkaSecret("jwt-secret-token", SEAL_SECRET)
    const overlay = unsealStoredTochkaSecrets(
      {
        jwt_token: sealedJwt,
        client_id: "keep-plain",
      },
      SEAL_SECRET
    ) as { jwt_token: string; client_id: string }

    expect(overlay.jwt_token).toBe("jwt-secret-token")
    expect(overlay.client_id).toBe("keep-plain")
  })
})
