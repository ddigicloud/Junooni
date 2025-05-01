"use client"
import React from "react"
import Image from "next/image"

/**
 * Generates initials from a customer's first and last name
 * @param {string} firstName - The customer's first name
 * @param {string} lastName - The customer's last name
 * @returns {string} - The customer's initials (1-2 characters)
 */
const getInitials = (firstName, lastName) => {
  let initials = ""

  // Get first character of first name if it exists
  if (firstName && typeof firstName === "string" && firstName.length > 0) {
    initials += firstName.charAt(0).toUpperCase()
  }

  // Get first character of last name if it exists
  if (lastName && typeof lastName === "string" && lastName.length > 0) {
    initials += lastName.charAt(0).toUpperCase()
  }

  // If we couldn't generate any initials, return a fallback
  if (initials.length === 0) {
    return "U" // For "User"
  }

  return initials
}

/**
 * Generates a consistent color based on the customer's name
 * @param {string} name - The customer's full name
 * @returns {string} - A hex color code
 */
const getAvatarColor = (name) => {
  // Simple hash function to generate a number from a string
  let hash = 0
  if (!name || name.length === 0) return "#e65100" // Default brand color

  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }

  // Convert the hash to a hex color
  let color = "#"
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff
    color += ("00" + value.toString(16)).substr(-2)
  }

  return color
}

/**
 * CustomerAvatar Component
 * Displays either a customer's profile image or their initials with a background color
 *
 * @param {Object} props - Component props
 * @param {string} props.firstName - Customer's first name
 * @param {string} props.lastName - Customer's last name
 * @param {string} props.imageUrl - URL to customer's profile image (optional)
 * @param {number} props.size - Size of avatar in pixels (default: 40)
 * @param {string} props.className - Additional CSS classes
 * @returns {React.ReactElement} - Avatar component
 */
const CustomerAvatar = ({
  firstName = "",
  lastName = "",
  imageUrl = null,
  size = 40,
  className = "",
}) => {
  const initials = getInitials(firstName, lastName)
  const fullName = `${firstName} ${lastName}`.trim()
  const bgColor = getAvatarColor(fullName)

  // Font size is proportional to the avatar size (40% of container size)
  const fontSize = Math.max(Math.floor(size * 0.4), 12)

  return (
    <div
      className={`relative overflow-hidden rounded-full ${className}`}
      style={{ width: size, height: size }}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={fullName || "User"}
          className="object-cover w-full h-full"
          width={size}
          height={size}
        />
      ) : (
        <div
          className="flex items-center justify-center w-full h-full font-medium text-white"
          style={{
            backgroundColor: bgColor,
            fontSize: `${fontSize}px`,
            lineHeight: `${size}px`,
          }}
        >
          {initials}
        </div>
      )}
    </div>
  )
}

export default CustomerAvatar
