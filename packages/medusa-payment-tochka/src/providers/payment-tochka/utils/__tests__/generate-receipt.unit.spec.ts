import { generateTochkaReceipt } from "../generate-receipt"

describe("generateTochkaReceipt", () => {
  it("throws when the trusted cart has no line items", () => {
    expect(() =>
      generateTochkaReceipt({
        id: "cart_1",
        email: "buyer@example.com",
        currency_code: "rub",
      })
    ).toThrow(/cart items/)
  })

  it("builds receipt lines from cart items without converting Medusa amounts", () => {
    const receipt = generateTochkaReceipt({
      email: "buyer@example.com",
      currency_code: "rub",
      items: [
        {
          product_title: "Альбом",
          variant_title: "default",
          quantity: 1,
          total: 8990,
        },
      ],
      shipping_address: { first_name: "Иван", last_name: "Иванов" },
    })

    expect(receipt.Client.name).toBe("Иванов Иван")
    expect(receipt.Items[0]?.amount).toBe(8990)
    expect(receipt.Items[0]?.name).toBe("Альбом (default)")
  })
})
