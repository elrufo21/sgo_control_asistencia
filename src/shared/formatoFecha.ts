export function formatoFecha(valor: string | null): string {
  if (!valor) return "—";
  return valor.replace(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}:\d{2}(?::\d{2})?))?$/, (_fecha, anio: string, mes: string, dia: string, hora?: string) =>
    `${dia}/${mes}/${anio}${hora ? ` ${hora}` : ""}`);
}
