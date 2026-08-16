import { toTochkaAmount, toTochkaUnitAmount } from "../tochka-amount"

describe("toTochkaAmount", () => {
  it("reads Medusa display amounts and BigNumber-like objects", () => {
    expect(toTochkaAmount(1)).toBe(1)
    expect(toTochkaAmount("1.50")).toBe(1.5)
    expect(toTochkaAmount({ numeric: "10" })).toBe(10)
    expect(toTochkaAmount({ value: "1" })).toBe(1)
  })

  it("uses unit price so receipt quantity does not multiply the line total", () => {
    expect(
      toTochkaUnitAmount({
        quantity: 2,
        total: 200,
        unit_price: 100,
      })
    ).toBe(100)
    expect(toTochkaUnitAmount({ quantity: 2, total: 200 })).toBe(100)
  })
})
