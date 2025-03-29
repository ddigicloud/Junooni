import { retrieveCustomer } from "@lib/data/customer"
import AccountDropdown from "../account-dropdown"
import { HttpTypes } from "@medusajs/types"

export default async function AccountButton() {
  const customer = await retrieveCustomer().catch(() => null) as HttpTypes.StoreCustomer | null

  return <AccountDropdown customer={customer} />
}