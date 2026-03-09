// ─── Cloudinary config ────────────────────────────────────────────────────────
// We use transformation URLs directly rather than the Node SDK so this module
// is safe to import in both server and edge environments.

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required environment variable: ${name}`)
  return value
}

function getCloudName(): string {
  return requireEnv('CLOUDINARY_CLOUD_NAME')
}

// ─── URL builder ──────────────────────────────────────────────────────────────

/**
 * Converts a plain Cloudinary upload URL into an optimised delivery URL
 * with automatic format (f_auto) and quality (q_auto), resized to the
 * requested dimensions.
 *
 * Accepts:
 *   - Full https://res.cloudinary.com/… URLs
 *   - Plain public_id strings (e.g. "properties/villa-barcelona")
 */
export function getOptimizedImageUrl(
  urlOrPublicId: string,
  width: number,
  height: number,
): string {
  const cloudName = getCloudName()
  const publicId = extractPublicId(urlOrPublicId, cloudName)
  const transforms = `f_auto,q_auto,w_${width},h_${height},c_fill`
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transforms}/${publicId}`
}

/**
 * Returns a small thumbnail URL (240 × 160).
 */
export function getThumbnailUrl(urlOrPublicId: string): string {
  return getOptimizedImageUrl(urlOrPublicId, 240, 160)
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Extracts the `public_id` (path after `/upload/`) from a full Cloudinary URL.
 * If the input is already a plain public_id it is returned unchanged.
 */
function extractPublicId(urlOrPublicId: string, cloudName: string): string {
  const marker = `/image/upload/`
  const idx = urlOrPublicId.indexOf(marker)
  if (idx === -1) return urlOrPublicId // already a public_id

  const afterUpload = urlOrPublicId.slice(idx + marker.length)

  // Strip any existing transformation prefix (e.g. "f_auto,q_auto/")
  // A transformation segment contains commas or underscores followed by a slash.
  const versionOrPathMatch = afterUpload.match(/^(?:[^/]+\/)?(.+)$/)
  if (!versionOrPathMatch) return afterUpload

  // If the first segment looks like a transformation string, skip it.
  const segments = afterUpload.split('/')
  if (segments[0].includes('_') || segments[0].includes(',')) {
    return segments.slice(1).join('/')
  }

  return afterUpload
}
