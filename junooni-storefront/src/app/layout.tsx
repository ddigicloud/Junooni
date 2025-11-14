// import { getBaseURL } from "@lib/util/env"
// import { Metadata } from "next"
// import "styles/globals.css"

// export const metadata: Metadata = {
//   metadataBase: new URL(getBaseURL()),
// }

// if (typeof window !== 'undefined'){Date.now()}

// export default function RootLayout(props: { children: React.ReactNode }) {
//   return (
//     <html lang="en" data-mode="light">
//       <body>
//         <main className="relative">{props.children}</main>
       
//       </body>
//     </html>
//   )
// }

import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import { Archivo_Black } from 'next/font/google'
import "styles/globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

// Load Archivo Black font
const archivoBlack = Archivo_Black({ 
  weight: '400', // Archivo Black only comes in one weight
  subsets: ['latin'],
  variable: '--font-archivo-black',
  display: 'swap',
})

if (typeof window !== 'undefined'){Date.now()}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="light" className={archivoBlack.variable}>
      <body>
        <main className="relative">{props.children}</main>
      </body>
    </html>
  )
}