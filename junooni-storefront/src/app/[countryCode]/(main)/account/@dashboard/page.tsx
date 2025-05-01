import { Metadata } from "next"

import { notFound } from "next/navigation"
import { followerList, retrieveCustomer } from "@lib/data/customer"
import { listOrders } from "@lib/data/orders"
import CustomerAccount from "@modules/account/components/customer-account"
import Overview from "@modules/account/components/overview"

export const metadata: Metadata = {
  title: "Account",
  description: "Overview of your account activity.",
}

export default async function OverviewTemplate() {
  const customer = await retrieveCustomer().catch(() => null)
  const orders = await listOrders()

  if (!orders) {
    notFound()
  }
  const creatorList = await followerList()

  if (!customer) {
    notFound()
  }

  return (
    <CustomerAccount
      customer={customer}
      Orders={orders}
      creatorList={creatorList}
    />

    // <div>
    //   <Overview customer={customer} orders={orders} />
    // </div>
  )
}
