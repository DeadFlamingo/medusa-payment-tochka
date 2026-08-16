import {
  applySecretPatch,
  applyTochkaOptionsPatch,
  DEFAULT_TOCHKA_OPTIONS,
  fromRuntimeTochkaOptions,
  hasTochkaStoreMetadata,
  isMaskedOrEmptySecret,
  maskSecret,
  mergeRuntimeTochkaOptions,
  mergeStoredTochkaOptions,
  parsePaymentModes,
  pickTochkaCustomerCode,
  preferReachablePaymentUrl,
  prettifyMaskedSecret,
  readEnvTochkaOptions,
  toPublicTochkaOptions,
  toRuntimeTochkaOptions,
  validateStorefrontUrl,
  validateWebhookPublicKeyJson,
} from "../tochka-options"

describe("Tochka stored options", () => {
  it("masks secrets the same way ApiShip shows tokens", () => {
    expect(maskSecret("6e4a1abcde40")).toBe("6e4a1***40")
    expect(prettifyMaskedSecret("6e4a1***40")).toBe("6e4a1•••40")
    expect(maskSecret("short")).toBe("short")
    expect(maskSecret("")).toBe("")
  })

  it("keeps the current secret when the admin sends an empty or already masked value", () => {
    expect(applySecretPatch("real-token", "")).toBe("real-token")
    expect(applySecretPatch("real-token", "6e4a1***40")).toBe("real-token")
    expect(applySecretPatch("real-token", "6e4a1•••40")).toBe("real-token")
    expect(applySecretPatch("real-token", "  next-token  ")).toBe("next-token")
    expect(isMaskedOrEmptySecret(undefined)).toBe(true)
  })

  it("parses payment modes and falls back to card", () => {
    expect(parsePaymentModes("card, sbp, unknown")).toEqual(["card", "sbp"])
    expect(parsePaymentModes(["dolyame", "card", "card"])).toEqual([
      "dolyame",
      "card",
    ])
    expect(parsePaymentModes("")).toEqual(["card"])
  })

  it("seeds from env and lets stored metadata win", () => {
    const fromEnv = readEnvTochkaOptions({
      TOCHKA_JWT_TOKEN: "env-jwt-token-value",
      TOCHKA_CLIENT_ID: "env-client",
      TOCHKA_WEBHOOK_PUBLIC_KEY: '{"kty":"RSA"}',
      TOCHKA_DEVELOPER_MODE: "true",
      TOCHKA_PAYMENT_MODES: "sbp,card",
      TOCHKA_WITH_RECEIPT: "false",
      STOREFRONT_URL: "https://shop.example/",
      TOCHKA_CUSTOMER_CODE: "300000092",
    })

    expect(fromEnv.client_id).toBe("env-client")
    expect(fromEnv.developer_mode).toBe(true)
    expect(fromEnv.with_receipt).toBe(false)
    expect(fromEnv.payment_mode).toEqual(["sbp", "card"])
    expect(fromEnv.storefront_url).toBe("https://shop.example")
    expect(fromEnv.customer_code).toBe("300000092")

    const merged = mergeStoredTochkaOptions(fromEnv, {
      client_id: "admin-client",
      developer_mode: false,
      payment_mode: ["dolyame"],
    })

    expect(merged.client_id).toBe("admin-client")
    expect(merged.developer_mode).toBe(false)
    expect(merged.payment_mode).toEqual(["dolyame"])
    expect(merged.jwt_token).toBe("env-jwt-token-value")
  })

  it("does not persist a masked JWT when the connection form is saved", () => {
    const next = applyTochkaOptionsPatch(
      {
        ...DEFAULT_TOCHKA_OPTIONS,
        jwt_token: "super-secret-token",
        client_id: "old-client",
      },
      {
        jwt_token: "super***en",
        client_id: "new-client",
        developer_mode: true,
      }
    )

    expect(next.jwt_token).toBe("super-secret-token")
    expect(next.client_id).toBe("new-client")
    expect(next.developer_mode).toBe(true)
  })

  it("exposes masked secrets to admin and full secrets to the payment provider", () => {
    const stored = {
      ...DEFAULT_TOCHKA_OPTIONS,
      jwt_token: "jwt-secret-token",
      webhook_public_key_json: '{"kty":"RSA","n":"abc"}',
      client_id: "client-1",
    }

    expect(toPublicTochkaOptions(stored)).toMatchObject({
      client_id: "client-1",
      jwt_token: "jwt-s***en",
      jwt_token_configured: true,
      webhook_public_key_configured: true,
    })

    expect(toRuntimeTochkaOptions(stored)).toMatchObject({
      tochkaJwtToken: "jwt-secret-token",
      clientId: "client-1",
      webhookPublicKeyJson: '{"kty":"RSA","n":"abc"}',
    })
  })

  it("lets admin-stored options override provider bootstrap options", () => {
    const runtime = mergeRuntimeTochkaOptions(
      {
        tochkaJwtToken: "boot-jwt",
        clientId: "boot-client",
        webhookPublicKeyJson: "{}",
        developerMode: true,
        paymentMode: ["card"],
      },
      {
        ...DEFAULT_TOCHKA_OPTIONS,
        jwt_token: "admin-jwt",
        client_id: "admin-client",
        webhook_public_key_json: '{"kty":"RSA"}',
        developer_mode: false,
        payment_mode: ["sbp"],
      }
    )

    expect(runtime).toMatchObject({
      tochkaJwtToken: "admin-jwt",
      clientId: "admin-client",
      developerMode: false,
      paymentMode: ["sbp"],
    })
  })

  it("round-trips runtime options and detects store metadata", () => {
    const runtime = toRuntimeTochkaOptions(DEFAULT_TOCHKA_OPTIONS)
    expect(fromRuntimeTochkaOptions(runtime)).toEqual(DEFAULT_TOCHKA_OPTIONS)
    expect(hasTochkaStoreMetadata({ tochka: { client_id: "x" } })).toBe(true)
    expect(hasTochkaStoreMetadata({ apiship: {} })).toBe(false)
  })

  it("rejects invalid webhook keys and storefront URLs", () => {
    expect(() =>
      validateWebhookPublicKeyJson('{"kty":"RSA","n":"abc"}')
    ).not.toThrow()
    expect(() => validateWebhookPublicKeyJson("not-json")).toThrow(
      /valid JSON/
    )
    expect(() => validateWebhookPublicKeyJson('{"n":"abc"}')).toThrow(/kty/)
    expect(() =>
      validateStorefrontUrl("https://shop.example")
    ).not.toThrow()
    expect(() => validateStorefrontUrl("")).not.toThrow()
    expect(() => validateStorefrontUrl("javascript:alert(1)")).toThrow(
      /http or https/
    )
    expect(() => validateStorefrontUrl("https://0.0.0.0:8010")).toThrow(
      /bind address/
    )
  })

  it("ignores a stored 0.0.0.0 storefront URL so env keeps the public site", () => {
    const fromEnv = readEnvTochkaOptions({
      STOREFRONT_URL: "https://deadflamingo.space",
    })
    const merged = mergeStoredTochkaOptions(fromEnv, {
      storefront_url: "https://0.0.0.0:8010",
    })

    expect(merged.storefront_url).toBe("https://deadflamingo.space")
  })

  it("uses the trusted public fail URL when Admin stored a listen address", () => {
    expect(
      preferReachablePaymentUrl(
        "https://0.0.0.0:8010",
        "https://deadflamingo.space/api/resume-checkout/cart_01TEST",
        "https://0.0.0.0:8010/api/resume-checkout/cart_01TEST"
      )
    ).toBe("https://deadflamingo.space/api/resume-checkout/cart_01TEST")
  })
})

describe("pickTochkaCustomerCode", () => {
  it("prefers the configured customer code over OpenBanking records", () => {
    expect(
      pickTochkaCustomerCode("300000092", [
        { customerType: "Business", customerCode: "from-api" },
      ])
    ).toBe("300000092")
  })

  it("uses a Business customer, then any customer with a code", () => {
    expect(
      pickTochkaCustomerCode("", [
        { customerType: "Individual", customerCode: "ind-1" },
        { customerType: "Business", customerCode: "biz-1" },
      ])
    ).toBe("biz-1")
    expect(
      pickTochkaCustomerCode(undefined, [
        { customerType: "Individual", customerCode: "ind-1" },
      ])
    ).toBe("ind-1")
    expect(pickTochkaCustomerCode("  ", [])).toBeUndefined()
  })
})
