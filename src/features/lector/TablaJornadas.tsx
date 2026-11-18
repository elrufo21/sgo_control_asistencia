import { useState } from "react";
import { Clock3 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import DataTable from "../../shared/ui/DataTable";
import { ErrorVista } from "../../shared/ui/Pagina";
import type { Jornada, PermisoLector } from "./api";

const columnas: ColumnDef<Jornada, unknown>[] = [
  { accessorKey: "fecha", header: "Fecha", cell: ({ row }) => row.original.fecha?.split("-").reverse().join("/") },
  { accessorKey: "nombres", header: "Personal" },
  { accessorKey: "ingreso", header: "Ingreso", cell: ({ getValue }) => String(getValue() || "—") },
  { accessorKey: "salidaRefrigerio", header: "Salida a refrigerio", cell: ({ getValue }) => String(getValue() || "—") },
  { accessorKey: "retornoRefrigerio", header: "Retorno de refrigerio", cell: ({ getValue }) => String(getValue() || "—") },
  { accessorKey: "salida", header: "Salida", cell: ({ getValue }) => String(getValue() || "—") },
  { id: "marcaciones", header: "Marcaciones", cell: ({ row }) => <span className={"jornadas-cantidad " + (row.original.nroMarcacion >= (row.original.marcacionesProgramadas || 4) ? "completa" : "")}>{row.original.nroMarcacion} / {row.original.marcacionesProgramadas || 4}</span> },
];

const horaPermiso = (valor: string | null, fecha: string) => {
  if (!valor) return "—";
  const dia = valor.slice(0, 10);
  return `${valor.slice(11, 19)}${dia !== fecha ? ` · ${dia.split("-").reverse().join("/")}` : ""}`;
};
const columnasPermisos: ColumnDef<PermisoLector, unknown>[] = [
  { accessorKey: "fecha", header: "Fecha", cell: ({ row }) => row.original.fecha.split("-").reverse().join("/") },
  { accessorKey: "nombres", header: "Personal" },
  { accessorKey: "salida", header: "Salida por permiso", cell: ({ row }) => horaPermiso(row.original.salida, row.original.fecha) },
  { accessorKey: "retorno", header: "Retorno de permiso", cell: ({ row }) => horaPermiso(row.original.retorno, row.original.fecha) },
  { accessorKey: "estado", header: "Estado", cell: ({ row }) => row.original.estado === "EN_CURSO" ? "En curso" : "Finalizado" },
];

export default function TablaJornadas({ jornada, identificado, jornadas, permisos, cargando = false, cargandoPermisos = false, errorJornadas = "", errorPermisos = "" }: { jornada?: Jornada | null; identificado: boolean; jornadas?: Jornada[]; permisos: PermisoLector[]; cargando?: boolean; cargandoPermisos?: boolean; errorJornadas?: string; errorPermisos?: string }) {
  const [vista, setVista] = useState<"asistencia" | "permisos">("asistencia");
  const esListado = jornadas !== undefined;
  const vacio = esListado ? <div className="jornadas-vacia"><Clock3 size={22} /><strong>No hay marcaciones de hoy</strong><span>Las jornadas aparecerán aquí cuando el personal marque su ingreso.</span></div> : <div className="jornadas-vacia"><Clock3 size={22} /><strong>{identificado ? "Sin jornada registrada" : "Esperando identificación"}</strong><span>{identificado ? "No se registró una marcación." : "Coloca tu dedo en el lector para consultar tus marcaciones."}</span></div>;
  const vacioPermisos = <div className="jornadas-vacia"><Clock3 size={22} /><strong>{esListado || identificado ? "Sin permisos para mostrar" : "Esperando identificación"}</strong><span>{esListado ? "Las salidas y retornos de hoy aparecerán aquí." : identificado ? "No hay salidas ni retornos de permiso para mostrar." : "Coloca tu dedo en el lector para consultar tus permisos."}</span></div>;
  const controles = <div className="lector-tabs" role="group" aria-label="Registros del lector">
    <button type="button" aria-pressed={vista === "asistencia"} onClick={() => setVista("asistencia")}>Asistencia</button>
    <button type="button" aria-pressed={vista === "permisos"} onClick={() => setVista("permisos")}>Permisos</button>
  </div>;
  const error = vista === "asistencia" ? errorJornadas : errorPermisos;
  return <div aria-label="Marcaciones de hoy">
    {error && <ErrorVista mensaje={error} />}
    {vista === "asistencia" ? <DataTable key="asistencia" columns={columnas} data={esListado ? jornadas : jornada ? [jornada] : []} filterKeys={["fecha", "nombres"]} storageKey="lector-jornadas-hoy" persistSearch={false} loading={cargando} action={controles} emptyContent={error ? <div className="data-table-empty">No se pudieron cargar las jornadas.</div> : vacio} />
      : <DataTable key="permisos" columns={columnasPermisos} data={permisos} filterKeys={["fecha", "nombres", "estado"]} storageKey="lector-permisos-hoy" persistSearch={false} loading={cargandoPermisos} action={controles} emptyContent={error ? <div className="data-table-empty">No se pudieron cargar los permisos.</div> : vacioPermisos} />}
  </div>;
}
