import { guardarRegistro, opcionesCatalogo } from "../../../../shared/api/catalogo";
import { cambiar } from "../../../../shared/api/http";

export type Feriado = { id: number; nombre: string; fecha: string };
export const listarFeriados = opcionesCatalogo<Feriado>("feriados");
export const guardarFeriado = (
  id: number | undefined,
  datos: Omit<Feriado, "id">,
) => guardarRegistro("feriados", id, datos);
export const eliminarFeriado = (id: number) =>
  cambiar(`feriados/${id}`, "DELETE");
