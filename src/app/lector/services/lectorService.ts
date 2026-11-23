import { consultar } from "../../../shared/api/http";
import { confirmarLocal, marcarLocal, usaLectorLocal } from "../../../shared/api/lectorLocal";

export type Jornada = {
  id: number;
  fecha: string;
  nombres: string;
  ingreso: string | null;
  salidaRefrigerio: string | null;
  retornoRefrigerio: string | null;
  salida: string | null;
  nroMarcacion: number;
  marcacionesProgramadas?: number;
  estado?: string;
};

export type PermisoLector = {
  id: number;
  fecha: string;
  nombres: string;
  salida: string | null;
  retorno: string | null;
  estado: string;
};

export type ResultadoLector = {
  registrada: boolean;
  tipo: string | null;
  tokenConfirmacion?: string | null;
  mensaje: string | null;
  fechaHora: string;
  personal: {
    codigo: string | null;
    nombres: string;
    area: string | null;
    dni: string;
    estado: string;
    foto: string | null;
  };
  jornada: Jornada | null;
  permisos?: PermisoLector[];
};

export function marcarConLector(signal: AbortSignal, modo: string) {
  if (usaLectorLocal) return marcarLocal<ResultadoLector>(signal, modo);
  return consultar<ResultadoLector>(`lector/marcar${modo ? `?modo=${modo}` : ""}`, {
    method: "POST",
    signal,
  });
}

export function consultarJornadasHoy(signal: AbortSignal, esAdmin: boolean) {
  return consultar<Jornada[]>(esAdmin ? "lector/jornadas-hoy" : "lector/publico/jornadas-hoy", { signal, cache: "no-store" });
}

export function consultarPermisosHoy(signal: AbortSignal, esAdmin: boolean) {
  return consultar<PermisoLector[]>(esAdmin ? "lector/permisos-hoy" : "lector/publico/permisos-hoy", { signal, cache: "no-store" });
}

export function confirmarMarcacion(token: string, signal: AbortSignal) {
  if (usaLectorLocal) return confirmarLocal<{ registrada: boolean; tipo: string; fechaHora: string; jornada: Jornada | null }>(signal, token);
  return consultar<{ registrada: boolean; tipo: string; fechaHora: string; jornada: Jornada | null }>("lector/confirmar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }), signal });
}
