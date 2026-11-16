import { useCallback, useState } from "react";
import { ClipboardList } from "lucide-react";
import { useConsulta } from "../../shared/hooks/useConsulta";
import { Field } from "../../shared/ui/Controls";
import { Listado, type Columna } from "../../shared/ui/Listado";
import { ErrorVista } from "../../shared/ui/Pagina";
import TextInput from "../../shared/ui/TextInput";
import { consultarReporte, type FilaReporte } from "./api";

const columnas: Columna<FilaReporte>[] = [
  ["fecha", "Fecha"],
  ["empleado", "Empleado"],
  ["turno", "Turno"],
  ["entradaProgramada", "Entrada programada"],
  ["salidaProgramada", "Salida programada"],
  ["entrada", "Entrada"],
  ["salidaRefrigerio", "Salida refrigerio"],
  ["retornoRefrigerio", "Retorno refrigerio"],
  ["salida", "Salida"],
  ["estado", "Estado"],
];

function hoy() {
  const fecha = new Date();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

export function ReportePage() {
  const [desde, setDesde] = useState(hoy);
  const [hasta, setHasta] = useState(hoy);
  const consultar = useCallback(
    (signal: AbortSignal) => consultarReporte(desde, hasta, signal),
    [desde, hasta],
  );
  const { datos, cargando, error } = useConsulta(consultar);
  return (
    <>
      <ErrorVista mensaje={error} />
      <Listado
        titulo="Consulta de asistencia"
        icono={ClipboardList}
        filas={datos ?? []}
        columnas={columnas}
        cargando={cargando}
        filtros={
          <div className="filters">
            <Field label="Desde">
              <TextInput
                type="date"
                value={desde}
                onChange={(e) => setDesde(e.currentTarget.value)}
              />
            </Field>
            <Field label="Hasta">
              <TextInput
                type="date"
                value={hasta}
                onChange={(e) => setHasta(e.currentTarget.value)}
              />
            </Field>
          </div>
        }
      />
    </>
  );
}
