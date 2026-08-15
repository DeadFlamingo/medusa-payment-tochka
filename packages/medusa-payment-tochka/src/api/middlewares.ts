import { defineMiddlewares } from "@medusajs/framework/http"
import { adminTochkaRoutesMiddlewares } from "./admin/tochka/middlewares"

export default defineMiddlewares({
  routes: [...adminTochkaRoutesMiddlewares],
})
