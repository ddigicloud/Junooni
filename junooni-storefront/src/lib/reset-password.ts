export async function updatePasswordWithToken(
  provider: "customer" | "vendor",
  email: string,
  password: string,
  token: string
) {
  const baseUrl = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"
  const path = `/auth/${provider}/emailpass/update`

  const res = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ email, password }),
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.message || "Failed to reset password.")
  }

  return res.json()
}
