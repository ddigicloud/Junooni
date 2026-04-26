// src/app/page.tsx
// Root route — only hit when:
// 1. Middleware didn't rewrite (something wrong with Host header)
// 2. Someone visits junooni.com directly (the main site, not a creator store)
//
// Show a debug-friendly message in dev, redirect to main site in prod.

export default function RootPage() {
  // In production this should never be reached if middleware is working
  // because tanishk.junooni.com/ gets rewritten to /tanishk/ by middleware
  if (process.env.NODE_ENV === "development") {
    return (
      <div style={{ padding: "2rem", fontFamily: "monospace" }}>
        <h1>Creator Store Root</h1>
        <p>
          In production this redirects to junooni.com.<br />
          In dev, visit <strong>localhost:3001/yourhandle</strong> to see a store.
        </p>
      </div>
    )
  }

  // Production: someone hit the bare domain without a subdomain
  // Use a meta-refresh so it works as a server component without importing redirect
  return (
    <html>
      <head>
        <meta httpEquiv="refresh" content="0; url=https://junooni.com" />
      </head>
      <body />
    </html>
  )
}