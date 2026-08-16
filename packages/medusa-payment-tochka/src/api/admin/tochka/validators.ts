import { z } from "@medusajs/framework/zod"
import {
  TOCHKA_PAYMENT_MODES,
  TOCHKA_TAX_SYSTEM_CODES,
  TOCHKA_VAT_TYPES,
} from "../../../lib/tochka-options"

export const AdminUpdateTochkaOptions = z.object({
  jwt_token: z.string().optional(),
  client_id: z.string().optional(),
  webhook_public_key_json: z.string().optional(),
  api_version: z.string().min(1).optional(),
  developer_mode: z.boolean().optional(),
  pre_authorization: z.boolean().optional(),
  payment_mode: z.array(z.enum(TOCHKA_PAYMENT_MODES)).min(1).optional(),
  payment_purpose: z.string().min(1).optional(),
  with_receipt: z.boolean().optional(),
  tax_system_code: z.enum(TOCHKA_TAX_SYSTEM_CODES).optional(),
  tax_item_default: z.enum(TOCHKA_VAT_TYPES).optional(),
  tax_shipping_default: z.enum(TOCHKA_VAT_TYPES).optional(),
  storefront_url: z.string().optional(),
  customer_code: z.string().optional(),
})

export type AdminUpdateTochkaOptions = z.infer<typeof AdminUpdateTochkaOptions>
