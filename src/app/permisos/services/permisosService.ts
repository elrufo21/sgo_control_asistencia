import { cambiar, consultar } from "../../../shared/api/http";

export type Permiso = { id: number; personalId: number; empleado: string; fecha: string; estado: string; salida: string | null; retorno: string | null };
export type Resumen = { id: number; empleado: string; estado: string; limite: number | null; usado: number };
export type Auditoria = { id: number; usuario: string; fechaHora: string; motivo: string; salidaAnterior: string | null; retornoAnterior: string | null; salidaNueva: string; retornoNuevo: string };
export type Respuesta = { resumen: Resumen[]; permisos: Permiso[] };

export const cargarPermisos = (mes: string, signal: AbortSignal) => consultar<Respuesta>(`permisos?mes=${mes}`, { signal });
export const guardarAsignacion = (id: number, mes: string, minutos: number) => cambiar(`permisos/asignaciones/${id}`, "PUT", { mes, minutos });
export const historialPermiso = (id: number) => consultar<Auditoria[]>(`permisos/${id}/historial`);
export const corregirPermiso = (id: number, salida: string, retorno: string, motivo: string) => cambiar(`permisos/${id}/corregir`, "PUT", { salida, retorno, motivo });
