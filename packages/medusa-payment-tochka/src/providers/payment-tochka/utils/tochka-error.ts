function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") {
    return null
  }
  return value as Record<string, unknown>
}

function stringifyUnknown(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim() && value !== "undefined") {
    return value.trim()
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value)
  }
  return undefined
}

export function describeTochkaFailure(error: unknown): string {
  if (error instanceof Error) {
    const message = stringifyUnknown(error.message)
    if (message) {
      return message
    }
  }

  const record = asRecord(error)
  if (!record) {
    return "Tochka payment request failed"
  }

  if ("error" in record && record.error) {
    const nested = describeTochkaFailure(record.error)
    if (nested !== "Tochka payment request failed") {
      return nested
    }
  }

  const description =
    stringifyUnknown(record.description) ??
    stringifyUnknown(record.message) ??
    stringifyUnknown(record.detail) ??
    stringifyUnknown(record.title)

  const code = stringifyUnknown(record.code) ?? stringifyUnknown(record.status)

  if (description && code) {
    return `${code} - ${description}`
  }
  if (description) {
    return description
  }
  if (code) {
    return `Tochka payment request failed (${code})`
  }

  try {
    const json = JSON.stringify(error)
    if (json && json !== "{}" && json !== "null") {
      return json
    }
  } catch {
    // ignore circular structures
  }

  return "Tochka payment request failed"
}
