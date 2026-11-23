import { consultar } from "../../shared/api/http";

export type FilaReporte = {
  id: number;
  personalId: number;
  fecha: string;
  empleado: string;
  turno: string | null;
  entradaProgramada: string | null;
  salidaProgramada: string | null;
  entrada: string | null;
  salidaRefrigerio: string | null;
  retornoRefrigerio: string | null;
  salida: string | null;
  estado: string;
  estadoMarcacion?: "COMPLETA" | "EN CURSO" | "INCOMPLETA" | "SIN HORARIO";
  marcacionesProgramadas?: number;
  tardanzas: number;
};
export function consultarReporte(
  desde: string,
  hasta: string,
  signal: AbortSignal,
) {
  return consultar<FilaReporte[]>(
    `reporte?${new URLSearchParams({ desde, hasta })}`,
    { signal },
  );
}
