// src/pages/vendors/login.tsx

import { NextPage } from "next"
import Head from "next/head"
import VendorTemplate from "@modules/vendor/templates/vendor-onboarding-template"

const Login: NextPage = () => {
  return (
    <>
      <Head>
        <title>Vendor Login</title>
        <meta name="description" content="Login to your vendor account" />
      </Head>
      <VendorTemplate />
    </>
  )
}

export default Login