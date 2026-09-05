/**
 * Utility to format, normalize, and resolve 3D GLTF model URLs across local static assets and AWS S3 CDN.
 */

const S3_BASE_URL =
  process.env.NEXT_PUBLIC_S3_MODELS_URL ||
  process.env.NEXT_PUBLIC_CLOUDFRONT_URL ||
  "https://paintit-3d-models-prod.s3.amazonaws.com";

export function formatModelUrl(url: string | null | undefined): string {
  if (!url) return "/models/selfcon.glb";
  const trimmed = url.trim();

  // If full HTTP/HTTPS URL (e.g. S3 or external CDN)
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  // Ensure leading slash for local public directory
  if (trimmed.startsWith("/models/")) {
    return trimmed;
  }

  if (trimmed.startsWith("models/")) {
    return `/${trimmed}`;
  }

  if (trimmed.startsWith("shells/") || trimmed.startsWith("assets/")) {
    return `/models/${trimmed}`;
  }

  if (trimmed.startsWith("/")) {
    return `/models${trimmed}`;
  }

  return `/models/${trimmed}`;
}

export function getS3FallbackUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const formatted = formatModelUrl(url);

  if (formatted.startsWith("http://") || formatted.startsWith("https://")) {
    return formatted;
  }

  const cleanPath = formatted.startsWith("/") ? formatted.slice(1) : formatted;
  return `${S3_BASE_URL}/${cleanPath}`;
}
