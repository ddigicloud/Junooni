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
//     <div className="flex items-center justify-center w-full min-h-screen px-0 py-0 md:px-4" 
//          style={{ backgroundColor: "#ffffff" }}>
//       <div className="w-full max-w-md p-0 bg-white rounded-lg shadow-sm">
//         {currentView === "sign-in" ? (
//           <Login setCurrentView={setCurrentView} />
//         ) : (
//           <Register setCurrentView={setCurrentView} />
//         )}
//       </div>
//     </div>
//   )
// }

// export default LoginTemplate

"use client"

import { useState } from "react"
import Register from "@modules/account/components/register"
import Login from "@modules/account/components/login"

export enum LOGIN_VIEW {
  SIGN_IN = "sign-in",
  REGISTER = "register",
}

const LoginTemplate = () => {
  const [currentView, setCurrentView] = useState<string>("sign-in")

  return (
    // Remove the wrapper container - let Login/Register handle their own layout
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