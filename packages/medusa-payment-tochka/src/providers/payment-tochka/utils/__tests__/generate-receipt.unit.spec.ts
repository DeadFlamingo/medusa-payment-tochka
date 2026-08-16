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
    expect(receipt.Items[0]?.paymentObject).toBe("goods")
  })

  it("uses unit price and marks gift cards as services", () => {
    const receipt = generateTochkaReceipt({
      email: "buyer@example.com",
      currency_code: "rub",
      items: [
        {
          product_title: "Сертификат",
          quantity: 1,
          total: 1,
          unit_price: 1,
          is_giftcard: true,
        },
      ],
    })

    expect(receipt.Items[0]?.amount).toBe(1)
    expect(receipt.Items[0]?.paymentObject).toBe("service")
  })

  it("treats product.is_giftcard as a service line", () => {
    const receipt = generateTochkaReceipt({
      email: "buyer@example.com",
      currency_code: "rub",
      items: [
        {
          product_title: "Сертификат",
          quantity: 1,
          total: 1,
          unit_price: 1,
          product: { is_giftcard: true },
        },
      ],
    })

    expect(receipt.Items[0]?.paymentObject).toBe("service")
  })
})
