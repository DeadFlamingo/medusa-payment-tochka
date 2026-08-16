import { unsealStoredTochkaSecrets } from "./tochka-secret-seal"
import {
  TOCHKA_PAYMENT_MODES,
  TOCHKA_TAX_SYSTEM_CODES,
  TOCHKA_VAT_TYPES,
  type TochkaPaymentMode,
  type TochkaTaxSystemCode,
  type TochkaVatType,
} from "./tochka-options-shared"

export {
  TOCHKA_PAYMENT_MODES,
  TOCHKA_TAX_SYSTEM_CODES,
  TOCHKA_VAT_TYPES,
  prettifyMaskedSecret,
} from "./tochka-options-shared"
export type {
  TochkaPaymentMode,
  TochkaTaxSystemCode,
  TochkaVatType,
} from "./tochka-options-shared"

export const TOCHKA_STORE_METADATA_KEY = "tochka"

export type StoredTochkaOptions = {
  jwt_token: string
  client_id: string
  webhook_public_key_json: string
  api_version: string
  developer_mode: boolean
  pre_authorization: boolean
  payment_mode: TochkaPaymentMode[]
  payment_purpose: string
  with_receipt: boolean
  tax_system_code: TochkaTaxSystemCode
  tax_item_default: TochkaVatType
  tax_shipping_default: TochkaVatType
  storefront_url: string
  customer_code: string
}

export type PublicTochkaOptions = Omit<
  StoredTochkaOptions,
  "jwt_token" | "webhook_public_key_json"
> & {
  jwt_token: string
  jwt_token_configured: boolean
  webhook_public_key_json: string
  webhook_public_key_configured: boolean
}

export type TochkaOptionsPatch = Partial<{
  jwt_token: string
  client_id: string
  webhook_public_key_json: string
  api_version: string
  developer_mode: boolean
  pre_authorization: boolean
  payment_mode: TochkaPaymentMode[]
  payment_purpose: string
  with_receipt: boolean
  tax_system_code: TochkaTaxSystemCode
  tax_item_default: TochkaVatType
  tax_shipping_default: TochkaVatType
  storefront_url: string
  customer_code: string
}>

export type RuntimeTochkaOptions = {
  tochkaJwtToken: string
  clientId: string
  webhookPublicKeyJson: string
  tochkaApiVersion: string
  developerMode: boolean
  preAuthorization: boolean
  paymentMode: TochkaPaymentMode[]
  paymentPurpose: string
  withReceipt: boolean
  taxSystemCode: TochkaTaxSystemCode
  taxItemDefault: TochkaVatType
  taxShippingDefault: TochkaVatType
  storefrontUrl: string
  customerCode: string
}

export const DEFAULT_TOCHKA_OPTIONS: StoredTochkaOptions = {
  jwt_token: "",
  client_id: "",
  webhook_public_key_json: "",
  api_version: "v1.0",
  developer_mode: false,
  pre_authorization: false,
  payment_mode: ["card"],
  payment_purpose: "Оплата заказа",
  with_receipt: true,
  tax_system_code: "usn_income",
  tax_item_default: "vat0",
  tax_shipping_default: "vat0",
  storefront_url: "",
  customer_code: "",
}

export function isTochkaPaymentMode(value: unknown): value is TochkaPaymentMode {
  return (
    typeof value === "string" &&
    (TOCHKA_PAYMENT_MODES as readonly string[]).includes(value)
  )
}

export function isTochkaTaxSystemCode(
  value: unknown
): value is TochkaTaxSystemCode {
  return (
    typeof value === "string" &&
    (TOCHKA_TAX_SYSTEM_CODES as readonly string[]).includes(value)
  )
}

export function isTochkaVatType(value: unknown): value is TochkaVatType {
  return (
    typeof value === "string" &&
    (TOCHKA_VAT_TYPES as readonly string[]).includes(value)
  )
}

export function parsePaymentModes(value: unknown): TochkaPaymentMode[] {
  const rawValues = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(",")
      : []

  const modes = Array.from(
    new Set(
      rawValues
        .map((mode) => (typeof mode === "string" ? mode.trim().toLowerCase() : ""))
        .filter(isTochkaPaymentMode)
    )
  )

  return modes.length ? modes : [...DEFAULT_TOCHKA_OPTIONS.payment_mode]
}

export function maskSecret(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) {
    return ""
  }
  if (trimmed.length <= 7) {
    return trimmed
  }
  return `${trimmed.slice(0, 5)}***${trimmed.slice(-2)}`
}

export function isMaskedOrEmptySecret(value: string | undefined): boolean {
  if (!value || !value.trim()) {
    return true
  }
  return value.includes("***") || value.includes("•••")
}

export function applySecretPatch(
  existing: string,
  incoming: string | undefined
): string {
  if (incoming === undefined || isMaskedOrEmptySecret(incoming)) {
    return existing
  }
  return incoming.trim()
}

function asBoolean(value: unknown, fallback: boolean): boolean {
  if (typeof value === "boolean") {
    return value
  }
  if (value === "true") {
    return true
  }
  if (value === "false") {
    return false
  }
  return fallback
}

function asString(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback
}

export function normalizeStoredTochkaOptions(
  value: unknown
): StoredTochkaOptions {
  const input =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {}

  return {
    jwt_token: asString(input.jwt_token, DEFAULT_TOCHKA_OPTIONS.jwt_token),
    client_id: asString(input.client_id, DEFAULT_TOCHKA_OPTIONS.client_id),
    webhook_public_key_json: asString(
      input.webhook_public_key_json,
      DEFAULT_TOCHKA_OPTIONS.webhook_public_key_json
    ),
    api_version: asString(
      input.api_version,
      DEFAULT_TOCHKA_OPTIONS.api_version
    ).trim() || DEFAULT_TOCHKA_OPTIONS.api_version,
    developer_mode: asBoolean(
      input.developer_mode,
      DEFAULT_TOCHKA_OPTIONS.developer_mode
    ),
    pre_authorization: asBoolean(
      input.pre_authorization,
      DEFAULT_TOCHKA_OPTIONS.pre_authorization
    ),
    payment_mode: parsePaymentModes(
      input.payment_mode ?? DEFAULT_TOCHKA_OPTIONS.payment_mode
    ),
    payment_purpose:
      asString(
        input.payment_purpose,
        DEFAULT_TOCHKA_OPTIONS.payment_purpose
      ).trim() || DEFAULT_TOCHKA_OPTIONS.payment_purpose,
    with_receipt: asBoolean(
      input.with_receipt,
      DEFAULT_TOCHKA_OPTIONS.with_receipt
    ),
    tax_system_code: isTochkaTaxSystemCode(input.tax_system_code)
      ? input.tax_system_code
      : DEFAULT_TOCHKA_OPTIONS.tax_system_code,
    tax_item_default: isTochkaVatType(input.tax_item_default)
      ? input.tax_item_default
      : DEFAULT_TOCHKA_OPTIONS.tax_item_default,
    tax_shipping_default: isTochkaVatType(input.tax_shipping_default)
      ? input.tax_shipping_default
      : DEFAULT_TOCHKA_OPTIONS.tax_shipping_default,
    storefront_url: asString(
      input.storefront_url,
      DEFAULT_TOCHKA_OPTIONS.storefront_url
    ).replace(/\/$/, ""),
    customer_code: asString(
      input.customer_code,
      DEFAULT_TOCHKA_OPTIONS.customer_code
    ).trim(),
  }
}

export function readEnvTochkaOptions(
  env: NodeJS.ProcessEnv = process.env
): StoredTochkaOptions {
  const withReceipt =
    env.TOCHKA_WITH_RECEIPT === undefined
      ? DEFAULT_TOCHKA_OPTIONS.with_receipt
      : env.TOCHKA_WITH_RECEIPT !== "false"

  return normalizeStoredTochkaOptions({
    jwt_token: env.TOCHKA_JWT_TOKEN ?? "",
    client_id: env.TOCHKA_CLIENT_ID ?? "",
    webhook_public_key_json: env.TOCHKA_WEBHOOK_PUBLIC_KEY ?? "",
    api_version: env.TOCHKA_API_VERSION,
    developer_mode: env.TOCHKA_DEVELOPER_MODE === "true",
    pre_authorization: env.TOCHKA_PRE_AUTHORIZATION === "true",
    payment_mode: env.TOCHKA_PAYMENT_MODES,
    payment_purpose: env.TOCHKA_PAYMENT_PURPOSE,
    with_receipt: withReceipt,
    tax_system_code: env.TOCHKA_TAX_SYSTEM_CODE,
    tax_item_default: env.TOCHKA_TAX_ITEM_DEFAULT,
    tax_shipping_default: env.TOCHKA_TAX_SHIPPING_DEFAULT,
    storefront_url: env.STOREFRONT_URL ?? "",
    customer_code: env.TOCHKA_CUSTOMER_CODE ?? "",
  })
}

export function isReachableStorefrontUrl(value: unknown): boolean {
  if (typeof value !== "string" || !value.trim()) {
    return false
  }

  try {
    const parsed = new URL(value.trim())
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false
    }

    const host = parsed.hostname.replace(/^\[|\]$/g, "").toLowerCase()
    return Boolean(host) && host !== "0.0.0.0" && host !== "::"
  } catch {
    return false
  }
}

export function preferReachablePaymentUrl(
  configuredStorefrontUrl: string,
  candidate: unknown,
  fallback: string
): string {
  if (isReachableStorefrontUrl(configuredStorefrontUrl)) {
    if (typeof candidate === "string") {
      try {
        const allowed = new URL(configuredStorefrontUrl)
        const actual = new URL(candidate)
        if (
          actual.origin === allowed.origin &&
          actual.protocol === allowed.protocol
        ) {
          return candidate
        }
      } catch {
        // Keep the configured origin instead of a forged or unparsable URL.
      }
    }

    return isReachableStorefrontUrl(fallback) ? fallback : configuredStorefrontUrl
  }

  if (isReachableStorefrontUrl(candidate)) {
    return String(candidate)
  }

  if (isReachableStorefrontUrl(fallback)) {
    return fallback
  }

  throw new Error(
    "Storefront URL cannot be a bind address like 0.0.0.0. Set the public site URL in Settings → Tochka or STOREFRONT_URL."
  )
}

export function mergeStoredTochkaOptions(
  base: StoredTochkaOptions,
  overlay: unknown
): StoredTochkaOptions {
  const unsealed = unsealStoredTochkaSecrets(overlay)
  const patch =
    unsealed && typeof unsealed === "object"
      ? (unsealed as Record<string, unknown>)
      : {}

  return normalizeStoredTochkaOptions({
    ...base,
    ...Object.fromEntries(
      Object.entries(patch).filter(([key, value]) => {
        if (value === undefined) {
          return false
        }

        // 0.0.0.0 is a listen address, not a browser URL. Keep STOREFRONT_URL.
        if (key === "storefront_url" && !isReachableStorefrontUrl(value)) {
          return value === ""
        }

        return true
      })
    ),
  })
}

export function applyTochkaOptionsPatch(
  current: StoredTochkaOptions,
  patch: TochkaOptionsPatch
): StoredTochkaOptions {
  return normalizeStoredTochkaOptions({
    ...current,
    ...patch,
    jwt_token: applySecretPatch(current.jwt_token, patch.jwt_token),
    webhook_public_key_json: applySecretPatch(
      current.webhook_public_key_json,
      patch.webhook_public_key_json
    ),
  })
}

export function toPublicTochkaOptions(
  options: StoredTochkaOptions
): PublicTochkaOptions {
  return {
    ...options,
    jwt_token: maskSecret(options.jwt_token),
    jwt_token_configured: Boolean(options.jwt_token.trim()),
    webhook_public_key_json: maskSecret(options.webhook_public_key_json),
    webhook_public_key_configured: Boolean(
      options.webhook_public_key_json.trim()
    ),
  }
}

export function toRuntimeTochkaOptions(
  options: StoredTochkaOptions
): RuntimeTochkaOptions {
  return {
    tochkaJwtToken: options.jwt_token,
    clientId: options.client_id,
    webhookPublicKeyJson: options.webhook_public_key_json,
    tochkaApiVersion: options.api_version,
    developerMode: options.developer_mode,
    preAuthorization: options.pre_authorization,
    paymentMode: options.payment_mode,
    paymentPurpose: options.payment_purpose,
    withReceipt: options.with_receipt,
    taxSystemCode: options.tax_system_code,
    taxItemDefault: options.tax_item_default,
    taxShippingDefault: options.tax_shipping_default,
    storefrontUrl: options.storefront_url,
    customerCode: options.customer_code,
  }
}

export function fromRuntimeTochkaOptions(
  options: Partial<RuntimeTochkaOptions>
): StoredTochkaOptions {
  return normalizeStoredTochkaOptions({
    jwt_token: options.tochkaJwtToken,
    client_id: options.clientId,
    webhook_public_key_json: options.webhookPublicKeyJson,
    api_version: options.tochkaApiVersion,
    developer_mode: options.developerMode,
    pre_authorization: options.preAuthorization,
    payment_mode: options.paymentMode,
    payment_purpose: options.paymentPurpose,
    with_receipt: options.withReceipt,
    tax_system_code: options.taxSystemCode,
    tax_item_default: options.taxItemDefault,
    tax_shipping_default: options.taxShippingDefault,
    storefront_url: options.storefrontUrl,
    customer_code: options.customerCode,
  })
}

export function mergeRuntimeTochkaOptions(
  bootstrap: Partial<RuntimeTochkaOptions>,
  stored: StoredTochkaOptions
): RuntimeTochkaOptions {
  return toRuntimeTochkaOptions(
    mergeStoredTochkaOptions(fromRuntimeTochkaOptions(bootstrap), stored)
  )
}

export function hasTochkaStoreMetadata(metadata: unknown): boolean {
  return Boolean(
    metadata &&
      typeof metadata === "object" &&
      TOCHKA_STORE_METADATA_KEY in (metadata as Record<string, unknown>) &&
      (metadata as Record<string, unknown>)[TOCHKA_STORE_METADATA_KEY] &&
      typeof (metadata as Record<string, unknown>)[TOCHKA_STORE_METADATA_KEY] ===
        "object"
  )
}

export function runtimeOptionsFingerprint(options: RuntimeTochkaOptions): string {
  return [
    options.tochkaJwtToken,
    options.clientId,
    options.webhookPublicKeyJson,
    options.tochkaApiVersion,
    String(options.developerMode),
  ].join("|")
}

export function validateWebhookPublicKeyJson(value: string): void {
  let parsed: unknown
  try {
    parsed = JSON.parse(value)
  } catch {
    throw new Error("Webhook public key must be valid JSON.")
  }

  if (
    !parsed ||
    typeof parsed !== "object" ||
    Array.isArray(parsed) ||
    typeof (parsed as { kty?: unknown }).kty !== "string"
  ) {
    throw new Error("Webhook public key must be a JWK object with a kty field.")
  }
}

export function validateStorefrontUrl(value: string): void {
  const trimmed = value.trim()
  if (!trimmed) {
    return
  }

  let parsed: URL
  try {
    parsed = new URL(trimmed)
  } catch {
    throw new Error("Storefront URL must be an absolute URL.")
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Storefront URL must use http or https.")
  }

  if (!isReachableStorefrontUrl(trimmed)) {
    throw new Error(
      "Storefront URL cannot be a bind address like 0.0.0.0. Use the public site URL."
    )
  }
}

export type TochkaCustomerRecord = {
  customerType?: string
  customerCode?: string
}

export const TOCHKA_BUSINESS_CUSTOMER_TYPE = "Business"

export function pickTochkaCustomerCode(
  configured: string | undefined,
  customers: TochkaCustomerRecord[] | undefined
): string | undefined {
  const fromConfig = configured?.trim()
  if (fromConfig) {
    return fromConfig
  }

  const list = customers ?? []
  return (
    list.find(
      (customer) =>
        customer.customerType === TOCHKA_BUSINESS_CUSTOMER_TYPE &&
        customer.customerCode
    )?.customerCode ?? list.find((customer) => customer.customerCode)?.customerCode
  )
}
