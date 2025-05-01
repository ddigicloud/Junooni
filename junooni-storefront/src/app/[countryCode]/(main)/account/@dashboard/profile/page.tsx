// main page
import { Metadata } from "next"
import ProfilePhone from "@modules/account/components/profile-phone"
import ProfileBillingAddress from "@modules/account/components/profile-billing-address"
import ProfileEmail from "@modules/account/components/profile-email"
import ProfileName from "@modules/account/components/profile-name"
import ProfilePassword from "@modules/account/components/profile-password"
import { notFound } from "next/navigation"
import { listRegions } from "@lib/data/regions"
import { retrieveCustomer } from "@lib/data/customer"

export const metadata: Metadata = {
  title: "Profile",
  description: "View and edit your Medusa Store profile.",
}

export default async function Profile() {
  const customer = await retrieveCustomer()
  const regions = await listRegions()

  if (!customer || !regions) {
    notFound()
  }

  return (
    <div
      className="w-full px-4 py-8 mx-auto sm:px-6"
      data-testid="profile-page-wrapper"
    >
      <div className="flex flex-col mb-8 gap-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Your Profile</h1>
        <p className="mb-4 text-gray-600">
          View and update your profile information, including your name, email,
          and phone number. You can also update your billing address, or change
          your password.
        </p>
      </div>

      <div className="flex flex-col space-y-6">
        {/* Each section gets full width and consistent styling */}
        <div>
          <ProfileName customer={customer} />
        </div>

        <div>
          <ProfileEmail customer={customer} />
        </div>

        <div>
          <ProfilePhone customer={customer} />
        </div>

        <div>
          <ProfilePassword customer={customer} />
        </div>

        <div>
          <ProfileBillingAddress customer={customer} regions={regions} />
        </div>
      </div>
    </div>
  )
}
