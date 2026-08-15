import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { getStoredTochkaOptionsStep } from "./steps/get-stored-tochka-options"

export const getTochkaRuntimeOptionsWorkflow = createWorkflow(
  "get-tochka-runtime-options",
  function () {
    const stored = getStoredTochkaOptionsStep()
    return new WorkflowResponse(stored)
  }
)
