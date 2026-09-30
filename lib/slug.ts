/**
 * PaintIT Slug Utility
 * Converts full names and titles into clean URL-friendly slugs.
 * e.g., "Idowu Tijesunimi" -> "idowu-tijesunimi"
 */

export function slugify(text: string): string {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}

export function getPainterShareableUrl(fullName: string | null | undefined, fallbackId?: string | number): string {
  const slug = fullName ? slugify(fullName) : fallbackId ? String(fallbackId) : "contractor";
  if (typeof window !== "undefined") {
    return `${window.location.origin}/${slug}`;
  }
  return `https://paint-it-six.vercel.app/${slug}`;
}
