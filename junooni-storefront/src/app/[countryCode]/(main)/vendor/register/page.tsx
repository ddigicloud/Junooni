// src/pages/vendors/register.tsx

import { NextPage } from "next"
import Head from "next/head"
import VendorTemplate from "@modules/vendor/templates/vendor-onboarding-template"


const Register: NextPage = () => {
  return (
    <>
      <Head>
        <title>Vendor Registration</title>
        <meta name="description" content="Register as a vendor" />
      </Head>
      <VendorTemplate />
    </>
  )
}

export default Register