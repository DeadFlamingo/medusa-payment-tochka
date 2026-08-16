import { PaymentSessionStatus } from "@medusajs/framework/utils"

import TochkaService from "../../services/tochka"

const logger = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}

function createProvider() {
  return new TochkaService(
    { logger },
    {
      tochkaJwtToken: "test-jwt",
      clientId: "test-client",
      webhookPublicKeyJson: "{}",
    }
  )
}

describe("authorizePayment", () => {
  it("reports a one-step Tochka payment as captured so Medusa can refund", async () => {
    const provider = createProvider()
    jest.spyOn(provider, "getPaymentStatus").mockResolvedValue({
      status: PaymentSessionStatus.CAPTURED,
      data: { status: "APPROVED", operationId: "op_1" },
    })

    const result = await provider.authorizePayment({
      data: { operationId: "op_1" },
    })

    expect(result.status).toBe(PaymentSessionStatus.CAPTURED)
  })

  it("keeps a two-step Tochka hold authorized until capture", async () => {
    const provider = createProvider()
    jest.spyOn(provider, "getPaymentStatus").mockResolvedValue({
      status: PaymentSessionStatus.AUTHORIZED,
      data: { status: "AUTHORIZED", operationId: "op_2" },
    })

    const result = await provider.authorizePayment({
      data: { operationId: "op_2" },
    })

    expect(result.status).toBe(PaymentSessionStatus.AUTHORIZED)
  })
})
