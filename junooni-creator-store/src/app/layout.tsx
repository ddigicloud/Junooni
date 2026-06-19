import type { Metadata } from "next"
import { Inter, Poppins, Playfair_Display, DM_Sans, Space_Grotesk,  Nunito, Raleway, Montserrat } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
})

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
})

const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito", display: "swap" })
const raleway = Raleway({ subsets: ["latin"], variable: "--font-raleway", display: "swap" })
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat", display: "swap" })

export const metadata: Metadata = {
  title: "Creator Store",
  description: "Official creator merchandise store",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable} ${playfair.variable} ${dmSans.variable} ${spaceGrotesk.variable} ${nunito.variable} ${raleway.variable} ${montserrat.variable}`}>
      <body>{children}</body>
    </html>
  )
}