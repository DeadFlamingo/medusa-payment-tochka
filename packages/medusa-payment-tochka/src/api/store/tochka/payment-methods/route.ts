import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import { getTochkaPaymentModesWorkflow } from "../../../../workflows/get-tochka-payment-modes"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { result } = await getTochkaPaymentModesWorkflow(req.scope).run()

  res.status(200).json(result)
}
