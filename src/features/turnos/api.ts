import {
  guardarRegistro,
  opcionesCatalogo,
  type Estado,
} from "../../shared/api/catalogo";
import { cambiar } from "../../shared/api/http";

export type DatosTurno = {
  nombre: string;
  entrada: string;
  salida: string;
  estado: Estado;
  marcaciones: 2 | 4;
  salidaRefrigerio: string | null;
  retornoRefrigerio: string | null;
  toleranciaAntes: number;
  toleranciaDespues: number;
  minutosEntre: number;
};
export type Turno = DatosTurno & { id: number };
export const listarTurnos = opcionesCatalogo<Turno>("turnos");
export const eliminarTurno = (id: number) => cambiar(`turnos/${id}`, "DELETE");
export const guardarTurno = (id: number | undefined, datos: DatosTurno) =>
  guardarRegistro("turnos", id, datos);
