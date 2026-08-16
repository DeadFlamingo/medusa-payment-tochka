import { describeTochkaFailure } from "../tochka-error"

describe("describeTochkaFailure", () => {
  it("reads the Tochka SDK HttpResponse error payload", () => {
    expect(
      describeTochkaFailure({
        ok: false,
        status: 400,
        error: {
          code: "400",
          description: "paymentMode tinkoff is not available",
        },
      })
    ).toBe("400 - paymentMode tinkoff is not available")
  })

  it("does not print undefined when the thrown value has no message", () => {
    expect(describeTochkaFailure({ ok: false, status: 500 })).toBe(
      "Tochka payment request failed (500)"
    )
    expect(describeTochkaFailure(new Error("undefined"))).toBe(
      "Tochka payment request failed"
    )
  })
})
