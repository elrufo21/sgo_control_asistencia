import { guardarRegistro, opcionesCatalogo } from "../../shared/api/catalogo";
import { cambiar } from "../../shared/api/http";

export type Area = { id: number; nombre: string };
export const listarAreas = opcionesCatalogo<Area>("areas");
export const guardarArea = (
  id: number | undefined,
  datos: Pick<Area, "nombre">,
) => guardarRegistro("areas", id, datos);
export const eliminarArea = (id: number) => cambiar(`areas/${id}`, "DELETE");
