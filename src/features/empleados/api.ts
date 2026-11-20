import {
  guardarRegistro,
  opcionesCatalogo,
  type Estado,
} from "../../shared/api/catalogo";
import { cambiar, consultar } from "../../shared/api/http";
import { capturarLocal, usaLectorLocal } from "../../shared/api/lectorLocal";

export type DatosEmpleado = {
  nombres: string;
  apellidos: string;
  dni: string;
  areaId: number | null;
  turnoId: number | null;
  nacimiento?: string | null;
  direccion?: string | null;
  ingreso?: string | null;
  telefono: string | null;
  email: string | null;
  estado: Estado;
};
export type Empleado = DatosEmpleado & {
  id: number;
  area: string | null;
  tieneFoto: boolean;
  tieneHuella: boolean;
};
export type ImagenHuella = { ancho: number; alto: number; pixeles: string };
type CapturaHuella = {
  lecturas: number;
  registrada: boolean;
  imagen?: ImagenHuella;
};
type DiaHorario = { diaSemana: number; turnoId: number | null };
type Horario = {
  configurado: boolean;
  turnoAnterior: number | null;
  dias: DiaHorario[];
};

export const listarEmpleados = opcionesCatalogo<Empleado>("empleados");
export const listarPersonalParaUsuarios = opcionesCatalogo<Pick<Empleado, "id" | "nombres" | "apellidos">>("catalogos/personal?uso=usuarios");
export const listarPersonalParaReporte = opcionesCatalogo<Pick<Empleado, "id" | "nombres" | "apellidos">>("catalogos/personal?uso=reporte");
export const eliminarEmpleado = (id: number) =>
  cambiar(`empleados/${id}`, "DELETE");
export function guardarEmpleado(
  id: number | undefined,
  datos: DatosEmpleado & { fotoBase64?: string; eliminarFoto: boolean },
) {
  return guardarRegistro("empleados", id, datos);
}
export const consultarHorario = (id: number) =>
  consultar<Horario>(`empleados/${id}/horario`);
export const guardarHorario = (id: number, dias: DiaHorario[]) =>
  cambiar(`empleados/${id}/horario`, "PUT", { dias });
export const capturarHuella = (id: number, signal: AbortSignal) =>
  usaLectorLocal ? capturarLocal<CapturaHuella>(id, signal) : consultar<CapturaHuella>(`empleados/${id}/huella/capturar`, {
    method: "POST",
    signal,
  });
