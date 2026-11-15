import { consultar } from "../../shared/api/http";
import { marcarLocal, usaLectorLocal } from "../../shared/api/lectorLocal";

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
};

export type ResultadoLector = {
  registrada: boolean;
  tipo: string | null;
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
};

export function marcarConLector(signal: AbortSignal) {
  if (usaLectorLocal) return marcarLocal<ResultadoLector>(signal);
  return consultar<ResultadoLector>("lector/marcar", {
    method: "POST",
    signal,
  });
}
