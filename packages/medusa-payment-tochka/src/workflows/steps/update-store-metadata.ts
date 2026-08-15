import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { IStoreModuleService } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

type UpdateStoreMetadataInput = {
  storeId: string
  metadata: Record<string, unknown>
  previousMetadata?: Record<string, unknown> | null
}

export const updateStoreMetadataStep = createStep(
  "update-tochka-store-metadata-step",
  async (input: UpdateStoreMetadataInput, { container }) => {
    const storeModuleService: IStoreModuleService = container.resolve(
      Modules.STORE
    )

    await storeModuleService.updateStores(input.storeId, {
      metadata: input.metadata,
    })

    return new StepResponse(input.metadata, {
      storeId: input.storeId,
      previousMetadata: input.previousMetadata ?? null,
    })
  },
  async (previous, { container }) => {
    if (!previous) {
      return
    }

    const storeModuleService: IStoreModuleService = container.resolve(
      Modules.STORE
    )

    await storeModuleService.updateStores(previous.storeId, {
      metadata: previous.previousMetadata,
    })
  }
)
