import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"

import { getTochkaPaymentModesStep } from "./steps/get-tochka-payment-modes"

export const getTochkaPaymentModesWorkflow = createWorkflow(
  "get-tochka-payment-modes",
  function () {
    const paymentModes = getTochkaPaymentModesStep()
    const result = transform(paymentModes, (payment_modes) => ({
      payment_modes,
    }))

    return new WorkflowResponse(result)
  }
)
