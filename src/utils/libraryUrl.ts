/** Explicit exact-origin allowlist. Empty until trusted library origins are configured. */
const trustedLibraryOrigins: readonly string[] = []
export function validateLibraryUrl(value?: string, trustedOrigins = trustedLibraryOrigins): string | null {
  if (!value) return null
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' || url.username || url.password || !trustedOrigins.includes(url.origin)) return null
    return url.href
  } catch { return null }
}
