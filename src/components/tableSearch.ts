// Búsqueda adaptada de DataTable de DNX: ignora tildes y exige todos los términos.
export const normalizeSearchText = (value: unknown) =>
  String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]+/g, " ").toLowerCase().trim();

export const getSearchableText = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.map(getSearchableText).filter(Boolean).join(" ");
  if (value instanceof Date) return normalizeSearchText(value.toISOString());
  if (typeof value === "object") return Object.values(value as Record<string, unknown>).map(getSearchableText).filter(Boolean).join(" ");
  return normalizeSearchText(value);
};

export function matchesSearch(row: Record<string, unknown>, keys: readonly string[], search: string) {
  const terms = normalizeSearchText(search).split(" ").filter(Boolean);
  const text = keys.map((key) => getSearchableText(row[key])).filter(Boolean).join(" ");
  return terms.every((term) => text.includes(term));
}
