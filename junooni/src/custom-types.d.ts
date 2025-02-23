import { AuthContext as MedusaAuthContext } from "@medusajs/framework/http"

declare module "@medusajs/framework/http" {
  interface AuthContext extends MedusaAuthContext {
    vendor_id?: string
  }
}