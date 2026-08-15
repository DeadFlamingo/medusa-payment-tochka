import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import {
  mergeStoredTochkaOptions,
  readEnvTochkaOptions,
  StoredTochkaOptions,
  TOCHKA_STORE_METADATA_KEY,
} from "../../lib/tochka-options"

type GetTochkaOptionsInput = {
  store: {
    metadata?: Record<string, unknown> | null
  }
}

export const getTochkaOptionsStep = createStep(
  "get-tochka-options-step",
  async ({ store }: GetTochkaOptionsInput) => {
    const stored = store.metadata?.[TOCHKA_STORE_METADATA_KEY]
    const options = mergeStoredTochkaOptions(readEnvTochkaOptions(), stored)

    return new StepResponse<StoredTochkaOptions>(options)
  }
)
