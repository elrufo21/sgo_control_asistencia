import { consultar } from "../../shared/api/http";

export type FilaReporte = {
  id: number;
  fecha: string;
  empleado: string;
  turno: string | null;
  entradaProgramada: string | null;
  salidaProgramada: string | null;
  entrada: string;
  salidaRefrigerio: string | null;
  retornoRefrigerio: string | null;
  salida: string | null;
  estado: string;
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
