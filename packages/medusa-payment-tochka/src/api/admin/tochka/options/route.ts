import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { toPublicTochkaOptions } from "../../../../lib/tochka-options"
import { getTochkaOptionsWorkflow } from "../../../../workflows/get-tochka-options"
import { updateTochkaOptionsWorkflow } from "../../../../workflows/update-tochka-options"
import { AdminUpdateTochkaOptions } from "../validators"

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const { result } = await getTochkaOptionsWorkflow(req.scope).run()

  res.status(200).json({
    tochka_options: toPublicTochkaOptions(result),
  })
}

export const POST = async (
  req: AuthenticatedMedusaRequest<AdminUpdateTochkaOptions>,
  res: MedusaResponse
) => {
  await updateTochkaOptionsWorkflow(req.scope).run({
    input: req.validatedBody,
  })

  const { result } = await getTochkaOptionsWorkflow(req.scope).run()

  res.status(200).json({
    tochka_options: toPublicTochkaOptions(result),
  })
}
