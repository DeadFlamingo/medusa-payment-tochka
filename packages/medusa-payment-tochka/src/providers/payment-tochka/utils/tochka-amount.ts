export function toTochkaAmount(amount: unknown): number {
  if (typeof amount === "number" && Number.isFinite(amount)) {
    return amount
  }

  if (typeof amount === "bigint") {
    return Number(amount)
  }

  if (typeof amount === "string") {
    const parsed = Number(amount.replace(",", ".").trim())
    if (Number.isFinite(parsed)) {
      return parsed
    }
  }

  if (amount && typeof amount === "object") {
    const record = amount as Record<string, unknown>
    if ("numeric" in record) {
      return toTochkaAmount(record.numeric)
    }
    if ("value" in record) {
      return toTochkaAmount(record.value)
    }
  }

  throw new Error("Invalid Tochka payment amount")
}

export function toTochkaUnitAmount(item: {
  quantity?: unknown
  total?: unknown
  unit_price?: unknown
}): number {
  if (item.unit_price !== undefined && item.unit_price !== null) {
    return toTochkaAmount(item.unit_price)
  }

  const total = toTochkaAmount(item.total)
  const quantity =
    typeof item.quantity === "number" && item.quantity > 0
      ? item.quantity
      : toTochkaAmount(item.quantity ?? 1)

  return quantity > 0 ? total / quantity : total
}
