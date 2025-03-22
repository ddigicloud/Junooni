import React from "react"

import Footer from "@modules/layout/templates/footer"
import Nav from "./nav"
import ClientNavContainer from "./nav/ClientNavContainer"


const Layout: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <div className="relative">
      <ClientNavContainer >
        <Nav />
        </ClientNavContainer>
      <main className="relative">{children}</main>
      <Footer />
    </div>
  )
}

export default Layout
