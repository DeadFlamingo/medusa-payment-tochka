import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { MedusaError } from "@medusajs/framework/utils"
import {
  applyTochkaOptionsPatch,
  isMaskedOrEmptySecret,
  mergeStoredTochkaOptions,
  readEnvTochkaOptions,
  TOCHKA_STORE_METADATA_KEY,
  TochkaOptionsPatch,
  validateStorefrontUrl,
  validateWebhookPublicKeyJson,
} from "../../lib/tochka-options"
import { sealStoredTochkaSecrets } from "../../lib/tochka-secret-seal"

type ComposeTochkaMetadataInput = {
  store: {
    id: string
    metadata?: Record<string, unknown> | null
  }
  data: TochkaOptionsPatch
}

export const composeTochkaMetadataStep = createStep(
  "compose-tochka-metadata-step",
  async ({ store, data }: ComposeTochkaMetadataInput) => {
    if (
      data.webhook_public_key_json &&
      !isMaskedOrEmptySecret(data.webhook_public_key_json)
    ) {
      try {
        validateWebhookPublicKeyJson(data.webhook_public_key_json)
      } catch (error) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          error instanceof Error ? error.message : "Invalid webhook public key."
        )
      }
    }

    if (data.storefront_url !== undefined) {
      try {
        validateStorefrontUrl(data.storefront_url)
      } catch (error) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          error instanceof Error ? error.message : "Invalid storefront URL."
        )
      }
    }

    const existingMetadata = (store.metadata ?? {}) as Record<string, unknown>
    const current = mergeStoredTochkaOptions(
      readEnvTochkaOptions(),
      existingMetadata[TOCHKA_STORE_METADATA_KEY]
    )
    const nextTochka = sealStoredTochkaSecrets(
      applyTochkaOptionsPatch(current, data)
    )

    return new StepResponse({
      storeId: store.id,
      previousMetadata: store.metadata ?? null,
      metadata: {
        ...existingMetadata,
        [TOCHKA_STORE_METADATA_KEY]: nextTochka,
      },
    })
  }
)
