import { cambiar, consultar } from "../../../shared/api/http";
import { registrarAtencionLocal, usaLectorLocal } from "../../../shared/api/lectorLocal";

export type Atencion = { id: number; personalId: number; profesional: string; pacienteDocumento: string; pacienteNombre: string; inicio: string; fin: string | null; duracionSegundos: number | null; detalle: string | null; metodoInicio: string; metodoFin: string | null };
export type Auditoria = { id: number; usuario: string; fechaHora: string; motivo: string; inicioAnterior: string; finAnterior: string; inicioNuevo: string; finNuevo: string };

type DatosAtencion = { accion: "INICIAR" | "FINALIZAR"; pacienteDocumento: string; pacienteNombre: string; detalle: string; codigo: string };
export const cargarAtenciones = (signal: AbortSignal) => consultar<Atencion[]>("atenciones", { signal, cache: "no-store" });
export function registrarAtencion(prueba: boolean, datos: DatosAtencion, signal: AbortSignal) {
  if (!prueba && usaLectorLocal) return registrarAtencionLocal<{ mensaje: string }>(signal, datos);
  return consultar<{ mensaje: string }>(prueba ? "atenciones/prueba" : "lector/atencion", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos), signal });
}
export const corregirAtencion = (id: number, inicio: string, fin: string, motivo: string) => cambiar(`atenciones/${id}/corregir`, "PUT", { inicio, fin, motivo });
export const historialAtencion = (id: number) => consultar<Auditoria[]>(`atenciones/${id}/historial`);
