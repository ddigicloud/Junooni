import { redirect } from "next/navigation"

// Root of the own-store app — redirect to main marketplace
// In production, subdomains always include a handle so this is rarely hit
export default function RootPage() {
  redirect("https://junooni.com")
}
