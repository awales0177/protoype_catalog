/** URLs for files in `public/` (CRA injects `PUBLIC_URL`). */
export function publicAssetUrl(relativePath) {
  const base = process.env.PUBLIC_URL || '';
  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const path = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
  return `${normalizedBase}${path}`;
}
