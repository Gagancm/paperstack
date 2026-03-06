/**
 * Format a date string to relative time (e.g., "2m ago", "Yesterday", "Mar 3")
 */
export function formatRelativeTime(dateString) {
  if (!dateString) return ''

  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHour < 24) return `${diffHour}h ago`
  if (diffDay === 1) return 'Yesterday'
  if (diffDay < 7) return `${diffDay}d ago`

  // Format as date
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Generate a unique ID
 */
export function generateId() {
  return Math.random().toString(36).substring(2, 15)
}

/**
 * Debounce a function
 */
export function debounce(fn, delay) {
  let timeoutId
  return function (...args) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn.apply(this, args), delay)
  }
}

/**
 * Throttle a function
 */
export function throttle(fn, limit) {
  let inThrottle
  return function (...args) {
    if (!inThrottle) {
      fn.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Strip HTML tags from a string
 */
export function stripHtml(html) {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

/**
 * Truncate a string to a maximum length
 */
export function truncate(str, maxLength = 100) {
  if (!str || str.length <= maxLength) return str
  return str.substring(0, maxLength).trim() + '...'
}

/**
 * Check if the device supports touch
 */
export function isTouchDevice() {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

/**
 * Check if the app is running as a PWA
 */
export function isPWA() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  )
}

/**
 * Check if the device is an iPad
 */
export function isIPad() {
  return (
    navigator.userAgent.match(/iPad/i) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  )
}

/**
 * Get initials from a name
 */
export function getInitials(name) {
  if (!name) return ''
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}
