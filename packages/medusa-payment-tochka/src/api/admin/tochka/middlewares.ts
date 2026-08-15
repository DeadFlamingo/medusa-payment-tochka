import {
  MiddlewareRoute,
  validateAndTransformBody,
} from "@medusajs/framework/http"
import { AdminUpdateTochkaOptions } from "./validators"

export const adminTochkaRoutesMiddlewares: MiddlewareRoute[] = [
  {
    matcher: "/admin/tochka/options",
    method: "POST",
    middlewares: [validateAndTransformBody(AdminUpdateTochkaOptions)],
  },
]
