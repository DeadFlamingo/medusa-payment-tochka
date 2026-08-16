import {
  isTochkaPaymentMode,
  type TochkaPaymentMode,
} from "../../../lib/tochka-options"

function defaultTochkaPaymentMode(modes: TochkaPaymentMode[]): TochkaPaymentMode[] {
  if (modes.includes("card")) {
    return ["card"]
  }
  if (modes.includes("sbp")) {
    return ["sbp"]
  }
  return [modes[0]]
}

export function resolveTochkaPaymentModes(
  allowed: unknown,
  requested?: unknown
): TochkaPaymentMode[] {
  const safeAllowed = Array.isArray(allowed)
    ? allowed.filter(isTochkaPaymentMode)
    : []
  const modes = safeAllowed.length ? safeAllowed : (["card"] as TochkaPaymentMode[])

  if (
    typeof requested === "string" &&
    isTochkaPaymentMode(requested) &&
    modes.includes(requested)
  ) {
    return [requested]
  }

  // Tochka rejects the whole payment if any value in paymentMode is not
  // enabled for the merchant (for example tinkoff or dolyame).
  return defaultTochkaPaymentMode(modes)
}
