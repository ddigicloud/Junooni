// "use client"

// import { useState } from "react"
// import Register from "@modules/account/components/register"
// import Login from "@modules/account/components/login"

// export enum LOGIN_VIEW {
//   SIGN_IN = "sign-in",
//   REGISTER = "register",
// }

// const LoginTemplate = () => {
//   const [currentView, setCurrentView] = useState<string>("sign-in")

//   return (
//     // Remove the wrapper container - let Login/Register handle their own layout
//     <>
//       {currentView === "sign-in" ? (
//         <Login setCurrentView={setCurrentView} />
//       ) : (
//         <Register setCurrentView={setCurrentView} />
//       )}
//     </>
//   )
// }

// export default LoginTemplate

"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Register from "@modules/account/components/register"
import Login from "@modules/account/components/login"

export enum LOGIN_VIEW {
  SIGN_IN = "sign-in",
  REGISTER = "register",
}

const LoginTemplate = () => {
  const searchParams = useSearchParams()
  const viewParam = searchParams.get("view")
  
  const [currentView, setCurrentView] = useState<string>("sign-in")

  // Update view when URL changes
  useEffect(() => {
    if (viewParam === "register") {
      setCurrentView("register")
    } else if (viewParam === "sign-in") {
      setCurrentView("sign-in")
    }
  }, [viewParam])

  return (
    <>
      {currentView === "sign-in" ? (
        <Login setCurrentView={setCurrentView} />
      ) : (
        <Register setCurrentView={setCurrentView} />
      )}
    </>
  )
}

export default LoginTemplate