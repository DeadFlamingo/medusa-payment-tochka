import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { IStoreModuleService } from "@medusajs/framework/types"
import { MedusaError, Modules } from "@medusajs/framework/utils"
import {
  hasTochkaStoreMetadata,
  mergeStoredTochkaOptions,
  readEnvTochkaOptions,
  TOCHKA_STORE_METADATA_KEY,
} from "../../lib/tochka-options"

export const getStoreStep = createStep(
  "get-tochka-store-step",
  async (_, { container }) => {
    const storeModuleService: IStoreModuleService = container.resolve(
      Modules.STORE
    )
    const stores = await storeModuleService.listStores(
      {},
      { select: ["id", "metadata"], take: 1 }
    )
    const store = stores?.[0]

    if (!store) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        "No store found to load Tochka options."
      )
    }

    if (hasTochkaStoreMetadata(store.metadata)) {
      return new StepResponse(store)
    }

    const seeded = mergeStoredTochkaOptions(
      readEnvTochkaOptions(),
      (store.metadata as Record<string, unknown> | undefined)?.[
        TOCHKA_STORE_METADATA_KEY
      ]
    )

    const updatedStore = await storeModuleService.updateStores(store.id, {
      metadata: {
        ...(store.metadata ?? {}),
        [TOCHKA_STORE_METADATA_KEY]: seeded,
      },
    })
    const nextStore = Array.isArray(updatedStore) ? updatedStore[0] : updatedStore

    return new StepResponse(nextStore ?? store)
  }
)
