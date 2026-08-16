import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { IStoreModuleService } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

import {
  mergeStoredTochkaOptions,
  readEnvTochkaOptions,
  TOCHKA_STORE_METADATA_KEY,
  type TochkaPaymentMode,
} from "../../lib/tochka-options"

export const getTochkaPaymentModesStep = createStep(
  "get-tochka-payment-modes-step",
  async (_, { container }) => {
    const storeModuleService: IStoreModuleService = container.resolve(
      Modules.STORE
    )
    const stores = await storeModuleService.listStores(
      {},
      { select: ["id", "metadata"], take: 1 }
    )
    const stored = stores?.[0]?.metadata?.[TOCHKA_STORE_METADATA_KEY]
    const options = mergeStoredTochkaOptions(readEnvTochkaOptions(), stored)

    return new StepResponse<TochkaPaymentMode[]>(options.payment_mode)
  }
)
