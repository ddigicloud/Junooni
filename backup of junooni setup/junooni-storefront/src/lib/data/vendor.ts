// src/lib/data/vendor.ts

export async function signupVendor(formData: FormData) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/vendors/register`,
      {
        method: "POST",
        credentials: "include",
        body: formData,
      }
    )

    if (!response.ok) {
      const { message } = await response.json()
      throw new Error(message || "Error creating vendor account")
    }

    return null
  } catch (error) {
    return error instanceof Error
      ? error.message
      : "An error occurred during registration"
  }
}

export async function loginVendor(formData: FormData) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/vendors/login`,
      {
        method: "POST",
        credentials: "include",
        body: formData,
      }
    )

    if (!response.ok) {
      const { message } = await response.json()
      throw new Error(message || "Invalid email or password")
    }

    return null
  } catch (error) {
    return error instanceof Error
      ? error.message
      : "An error occurred during login"
  }
}