import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { IStoreModuleService } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { TOCHKA_STORE_METADATA_KEY } from "../../lib/tochka-options"

export const getStoredTochkaOptionsStep = createStep(
  "get-stored-tochka-options-step",
  async (_, { container }) => {
    const storeModuleService: IStoreModuleService = container.resolve(
      Modules.STORE
    )
    const stores = await storeModuleService.listStores(
      {},
      { select: ["id", "metadata"], take: 1 }
    )
    const stored = stores?.[0]?.metadata?.[TOCHKA_STORE_METADATA_KEY]

    return new StepResponse(
      stored && typeof stored === "object" ? stored : {}
    )
  }
)
