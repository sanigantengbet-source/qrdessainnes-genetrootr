/**
 * Safe slugification for downloadable filenames.
 * Example: "SANN STORE" -> "sann-store.png"
 */
export function slugifyFilename(name: string, extension = 'png'): string {
  if (!name || !name.trim()) {
    return `qr-code-${Date.now()}.${extension.replace(/^\./, '')}`;
  }

  const clean = name
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-z0-9-_ ]/g, '') // remove special chars
    .replace(/\s+/g, '-') // replace spaces with hyphens
    .replace(/-+/g, '-') // collapse consecutive hyphens
    .replace(/^-+|-+$/g, ''); // trim leading/trailing hyphens

  const ext = extension.replace(/^\./, '');
  return `${clean || 'qr-code'}.${ext}`;
}
