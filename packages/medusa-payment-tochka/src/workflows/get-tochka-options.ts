import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { getStoreStep } from "./steps/get-store"
import { getTochkaOptionsStep } from "./steps/get-tochka-options"

export const getTochkaOptionsWorkflow = createWorkflow(
  "get-tochka-options",
  function () {
    const store = getStoreStep()
    const tochkaOptions = getTochkaOptionsStep({ store })

    return new WorkflowResponse(tochkaOptions)
  }
)
