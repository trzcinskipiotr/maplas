export function isStringFloat(n: string) {
  const parsed = parseFloat(n);
  return !isNaN(parsed) && isFinite(parsed);
}
