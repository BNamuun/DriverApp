// API base URL configuration
// In development: uses Vite proxy (relative URLs work)
// In production: uses full backend URL from environment variable
export const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || ''

export function getApiUrl(endpoint: string): string {
  // Remove leading slash from endpoint if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
  
  // If API_BASE_URL is empty (dev mode), return relative URL for proxy
  if (!API_BASE_URL) {
    return `/${cleanEndpoint}`
  }
  
  // In production, use full URL
  return `${API_BASE_URL}/${cleanEndpoint}`
}
