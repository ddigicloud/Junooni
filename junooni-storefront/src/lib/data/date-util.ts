/**
 * Formats a date string into a human-readable format
 * @param dateString - ISO date string to format
 * @returns Formatted date string
 */
export const formatDate = (dateString?: string) => {
    if (!dateString) {
      return "N/A"
    }
  
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  
    return new Date(dateString).toLocaleDateString(undefined, options)
  }
  
  /**
   * Formats a date string with time
   * @param dateString - ISO date string to format
   * @returns Formatted date and time string
   */
  export const formatDateTime = (dateString?: string) => {
    if (!dateString) {
      return "N/A"
    }
  
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  
    return new Date(dateString).toLocaleString(undefined, options)
  }
  
  /**
   * Gets a relative time string (e.g., "2 days ago")
   * @param dateString - ISO date string
   * @returns Relative time string
   */
  export const getRelativeTime = (dateString?: string) => {
    if (!dateString) {
      return "N/A"
    }
  
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
    if (diffInSeconds < 60) {
      return "just now"
    }
  
    const diffInMinutes = Math.floor(diffInSeconds / 60)
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""} ago`
    }
  
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`
    }
  
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 30) {
      return `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`
    }
  
    const diffInMonths = Math.floor(diffInDays / 30)
    if (diffInMonths < 12) {
      return `${diffInMonths} month${diffInMonths !== 1 ? "s" : ""} ago`
    }
  
    const diffInYears = Math.floor(diffInMonths / 12)
    return `${diffInYears} year${diffInYears !== 1 ? "s" : ""} ago`
  }
  