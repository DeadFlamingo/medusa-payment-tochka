import {
  createWorkflow,
} from "@medusajs/framework/workflows-sdk"
import { TochkaOptionsPatch } from "../lib/tochka-options"
import { composeTochkaMetadataStep } from "./steps/compose-tochka-metadata"
import { getStoreStep } from "./steps/get-store"
import { updateStoreMetadataStep } from "./steps/update-store-metadata"

export const updateTochkaOptionsWorkflow = createWorkflow(
  "update-tochka-options",
  function (input: TochkaOptionsPatch) {
    const store = getStoreStep()
    const patchPayload = composeTochkaMetadataStep({
      store,
      data: input,
    })

    updateStoreMetadataStep({
      storeId: patchPayload.storeId,
      metadata: patchPayload.metadata,
      previousMetadata: patchPayload.previousMetadata,
    })
  }
)
