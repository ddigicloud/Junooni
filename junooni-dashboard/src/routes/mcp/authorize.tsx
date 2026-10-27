// import { createFileRoute } from '@tanstack/react-router'

// export const Route = createFileRoute('/mcp/authorize')({
//   component: RouteComponent,
// })

// function RouteComponent() {
//   return <div>Hello "/mcp/authorize"!</div>
// }


import { createFileRoute } from "@tanstack/react-router"
import McpAuthorizePage from "../../features/mcp-authorize"

export const Route = createFileRoute("/mcp/authorize")({
  component: McpAuthorizePage,
})