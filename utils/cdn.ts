/**
 * Utility helper to resolve 3D model GLB paths to AWS CloudFront CDN.
 * Ensures 100% of 3D models in production and staging stream directly from AWS S3 + CloudFront CDN.
 */
export const DEFAULT_AWS_CLOUDFRONT_CDN = "https://d2bzch6iq8q85.cloudfront.net";

export function getCDNModelUrl(modelUrl: string): string {
  if (!modelUrl) return "";
  
  // If already a full URL, return as-is
  if (modelUrl.startsWith("http://") || modelUrl.startsWith("https://")) {
    return modelUrl;
  }

  // Get CDN Base URL from env or fallback to Production AWS CloudFront CDN
  const cdnBase = (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_3D_CDN_URL)
    ? process.env.NEXT_PUBLIC_3D_CDN_URL
    : DEFAULT_AWS_CLOUDFRONT_CDN;

  const cleanBase = cdnBase.endsWith("/") ? cdnBase.slice(0, -1) : cdnBase;
  const cleanPath = modelUrl.startsWith("/") ? modelUrl : `/${modelUrl}`;

  return `${cleanBase}${cleanPath}`;
}
