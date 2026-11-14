import {
  guardarRegistro,
  opcionesCatalogo,
  type Estado,
} from "../../shared/api/catalogo";

export type DatosTurno = {
  nombre: string;
  entrada: string;
  salida: string;
  estado: Estado;
  marcaciones: 2 | 4;
};
export type Turno = DatosTurno & { id: number };
export const listarTurnos = opcionesCatalogo<Turno>("turnos");
export const guardarTurno = (id: number | undefined, datos: DatosTurno) =>
  guardarRegistro("turnos", id, datos);
