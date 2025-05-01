// import { Metadata } from "next"
// import { notFound } from "next/navigation"

// import AddressBook from "@modules/account/components/address-book"

// import { getRegion } from "@lib/data/regions"
// import { retrieveCustomer } from "@lib/data/customer"

// export const metadata: Metadata = {
//   title: "Addresses",
//   description: "View your addresses",
// }

// export default async function Addresses(props: {
//   params: Promise<{ countryCode: string }>
// }) {
//   const params = await props.params
//   const { countryCode } = params
//   const customer = await retrieveCustomer()
//   const region = await getRegion(countryCode)

//   if (!customer || !region) {
//     notFound()
//   }

//   return (
//     <div className="w-full" data-testid="addresses-page-wrapper">
//       <div className="flex flex-col mb-8 gap-y-4">
//         <h1 className="text-2xl-semi">Shipping Addresses</h1>
//         <p className="text-base-regular">
//           View and update your shipping addresses, you can add as many as you
//           like. Saving your addresses will make them available during checkout.
//         </p>
//       </div>
//       <AddressBook customer={customer} region={region} />
//     </div>
//   )
// }

import { Metadata } from "next"
import { notFound } from "next/navigation"
import AddressBook from "@modules/account/components/address-book"
import { getRegion } from "@lib/data/regions"
import { retrieveCustomer } from "@lib/data/customer"

export const metadata: Metadata = {
  title: "Addresses",
  description: "View and manage your shipping addresses",
}

export default async function Addresses(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params
  const { countryCode } = params
  const customer = await retrieveCustomer()
  const region = await getRegion(countryCode)

  if (!customer || !region) {
    notFound()
  }

  return (
    <div
      className="w-full p-6 mx-auto bg-gray-50"
      data-testid="addresses-page-wrapper"
    >
      <div className="flex flex-col mb-8 gap-y-4">
        <h1 className="text-3xl  font-semibold text-[#e65100]">
          Shipping Addresses
        </h1>
        <div className="h-1 w-20 bg-[#e65100]/80 rounded"></div>
        <p className="max-w-2xl mt-2 text-gray-700 text-base-regular">
          View and update your shipping addresses. You can add as many addresses
          as you need. Saving your addresses will make them available during
          checkout for faster ordering.
        </p>
      </div>

      <div className="p-4 bg-white rounded-lg shadow-sm sm:p-6 md:p-8">
        <AddressBook customer={customer} region={region} />
      </div>
    </div>
  )
}
