import { Metadata } from "next"

import Overview from "@modules/account/components/overview"
import { notFound } from "next/navigation"
import { followerList, retrieveCustomer } from "@lib/data/customer"
import { listOrders } from "@lib/data/orders"
import CustomerAccount from "@modules/account/components/customer-account"

export const metadata: Metadata = {
  title: "Account",
  description: "Overview of your account activity.",
}

export default async function OverviewTemplate() {
  const customer = await retrieveCustomer().catch(() => null)
  const orders = (await listOrders().catch(() => null)) || null
  const creatorList = await followerList()
  

  if (!customer) {
    notFound()
  }

  return <CustomerAccount customer={customer} orders={orders} creatorList={creatorList} />
}
