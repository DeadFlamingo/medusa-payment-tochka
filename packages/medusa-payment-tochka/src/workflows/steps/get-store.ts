import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { IStoreModuleService } from "@medusajs/framework/types"
import { MedusaError, Modules } from "@medusajs/framework/utils"
import {
  hasTochkaStoreMetadata,
  mergeStoredTochkaOptions,
  readEnvTochkaOptions,
  TOCHKA_STORE_METADATA_KEY,
} from "../../lib/tochka-options"
import {
  hasPlaintextTochkaSecrets,
  resolveTochkaSealSecret,
  sealStoredTochkaSecrets,
} from "../../lib/tochka-secret-seal"

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

    const rawStored = (store.metadata as Record<string, unknown> | undefined)?.[
      TOCHKA_STORE_METADATA_KEY
    ]
    const shouldPersist =
      !hasTochkaStoreMetadata(store.metadata) ||
      (Boolean(resolveTochkaSealSecret()) && hasPlaintextTochkaSecrets(rawStored))

    if (!shouldPersist) {
      return new StepResponse(store)
    }

    const seeded = sealStoredTochkaSecrets(
      mergeStoredTochkaOptions(readEnvTochkaOptions(), rawStored)
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
