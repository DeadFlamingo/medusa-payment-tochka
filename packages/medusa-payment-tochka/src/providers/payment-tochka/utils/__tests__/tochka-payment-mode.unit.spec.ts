import { resolveTochkaPaymentModes } from "../tochka-payment-mode"

describe("resolveTochkaPaymentModes", () => {
  it("keeps a requested mode only when admin already enabled it", () => {
    expect(resolveTochkaPaymentModes(["card", "sbp"], "sbp")).toEqual(["sbp"])
    expect(resolveTochkaPaymentModes(["card", "sbp", "tinkoff"], "dolyame")).toEqual([
      "card",
    ])
  })

  it("falls back to card when admin left the list empty", () => {
    expect(resolveTochkaPaymentModes([], "sbp")).toEqual(["card"])
  })

  it("sends one default mode instead of every admin method", () => {
    expect(resolveTochkaPaymentModes(["sbp", "tinkoff", "dolyame"])).toEqual([
      "sbp",
    ])
    expect(resolveTochkaPaymentModes(["card", "sbp", "tinkoff"])).toEqual([
      "card",
    ])
  })
})
