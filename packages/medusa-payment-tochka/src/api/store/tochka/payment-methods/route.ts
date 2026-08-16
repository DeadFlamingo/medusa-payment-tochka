import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import { getTochkaOptionsWorkflow } from "../../../../workflows/get-tochka-options"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { result } = await getTochkaOptionsWorkflow(req.scope).run()

  res.status(200).json({
    payment_modes: result.payment_mode,
  })
}
