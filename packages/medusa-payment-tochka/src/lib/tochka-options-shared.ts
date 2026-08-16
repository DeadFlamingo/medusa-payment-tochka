export const TOCHKA_PAYMENT_MODES = [
  "card",
  "sbp",
  "tinkoff",
  "dolyame",
] as const

export const TOCHKA_TAX_SYSTEM_CODES = [
  "osn",
  "usn_income",
  "usn_income_outcome",
  "esn",
  "patent",
] as const

export const TOCHKA_VAT_TYPES = [
  "none",
  "vat0",
  "vat5",
  "vat7",
  "vat10",
  "vat20",
  "vat105",
  "vat107",
  "vat110",
  "vat120",
] as const

export type TochkaPaymentMode = (typeof TOCHKA_PAYMENT_MODES)[number]
export type TochkaTaxSystemCode = (typeof TOCHKA_TAX_SYSTEM_CODES)[number]
export type TochkaVatType = (typeof TOCHKA_VAT_TYPES)[number]

export function prettifyMaskedSecret(value: string): string {
  return value.replace("***", "•••")
}
