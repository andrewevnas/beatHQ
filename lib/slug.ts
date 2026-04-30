export const SLUG_RE = /^[A-Za-z0-9][A-Za-z0-9\-]*_\d+(?:bpm)?_[A-Za-z][A-Za-z0-9#b]*$/;

export function isValidSlug(s: string): boolean {
  return SLUG_RE.test(s);
}
