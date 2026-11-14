import { cambiar, consultar } from "./http";

export type Estado = "ACTIVO" | "INACTIVO";

export function guardarRegistro(
  path: string,
  id: number | undefined,
  data: object,
) {
  return id === undefined
    ? cambiar(path, "POST", data)
    : cambiar(`${path}/${id}`, "PUT", data);
}

export function opcionesCatalogo<T>(path: string) {
  return (signal?: AbortSignal) => consultar<T[]>(path, { signal });
}
