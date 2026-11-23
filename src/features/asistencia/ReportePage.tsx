import { useCallback, useState } from "react";
import { FileText, Search, TriangleAlert } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { listarPersonalParaReporte } from "../empleados/api";
import { useConsulta } from "../../shared/hooks/useConsulta";
import { formatoFecha } from "../../shared/formatoFecha";
import { Button, Field, Select } from "../../shared/ui/Controls";
import DataTable from "../../shared/ui/DataTable";
import { ErrorVista } from "../../shared/ui/Pagina";
import TextInput from "../../shared/ui/TextInput";
import { consultarReporte, type FilaReporte } from "./api";
import "./reporte.css";

const dia = (fecha: string) => new Date(`${fecha}T12:00:00`).toLocaleDateString("es-PE", { weekday: "long" }).toLocaleUpperCase("es-PE");
function marcacion(valor: string | null, fila: FilaReporte, nombre: string, requerida = true) {
  if (valor) return valor;
  if (fila.estadoMarcacion !== "INCOMPLETA" || !requerida) return "—";
  return <span className="reporte-marca-faltante" role="img" aria-label={`Falta ${nombre}`} title={`Falta ${nombre}`}><TriangleAlert size={16} aria-hidden="true" /></span>;
}
const columnas: ColumnDef<FilaReporte, unknown>[] = [
  { accessorKey: "fecha", header: "Fecha", cell: ({ row }) => formatoFecha(row.original.fecha) },
  { id: "dia", header: "Día", cell: ({ row }) => dia(row.original.fecha) },
  { accessorKey: "empleado", header: "Nombres" },
  { accessorKey: "entrada", header: "Ingreso", cell: ({ row }) => marcacion(row.original.entrada, row.original, "ingreso") },
  { accessorKey: "salidaRefrigerio", header: "Salida refrigerio", cell: ({ row }) => marcacion(row.original.salidaRefrigerio, row.original, "salida a refrigerio", row.original.marcacionesProgramadas === 4) },
  { accessorKey: "retornoRefrigerio", header: "Retorno refrigerio", cell: ({ row }) => marcacion(row.original.retornoRefrigerio, row.original, "retorno de refrigerio", row.original.marcacionesProgramadas === 4) },
  { accessorKey: "salida", header: "Salida", cell: ({ row }) => marcacion(row.original.salida, row.original, "salida") },
  { accessorKey: "tardanzas", header: "N.º tardanzas" },
  { accessorKey: "estado", header: "Asistencia", cell: ({ row }) => <strong className={row.original.estado === "TARDANZA" ? "reporte-tardanza" : "reporte-asistencia"}>{row.original.estado}</strong> },
  { accessorKey: "estadoMarcacion", header: "Marcaciones", cell: ({ row }) => row.original.estadoMarcacion === "INCOMPLETA" ? <span className="reporte-incompleta"><TriangleAlert size={16} aria-hidden="true" /> Incompleta</span> : row.original.estadoMarcacion === "EN CURSO" ? "En curso" : row.original.estadoMarcacion === "SIN HORARIO" ? "Sin horario registrado" : row.original.estadoMarcacion === "COMPLETA" ? "Completa" : "—" },
];
const hoy = () => new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Lima", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());

export function ReportePage() {
  const [desde, setDesde] = useState(hoy);
  const [hasta, setHasta] = useState(hoy);
  const [rango, setRango] = useState(() => ({ desde: hoy(), hasta: hoy() }));
  const [errorRango, setErrorRango] = useState("");
  const [personal, setPersonal] = useState("");
  const [general, setGeneral] = useState(true);
  const [exportando, setExportando] = useState(false);
  const [errorExportacion, setErrorExportacion] = useState("");
  const empleados = useConsulta(listarPersonalParaReporte);
  const consultar = useCallback((signal: AbortSignal) => consultarReporte(rango.desde, rango.hasta, signal), [rango]);
  const reporte = useConsulta(consultar);
  const filas = (general || personal ? reporte.datos ?? [] : []).filter((fila) => general || String(fila.personalId) === personal).sort((a, b) => a.fecha.localeCompare(b.fecha) || (b.entrada ?? "").localeCompare(a.entrada ?? ""));
  function buscar(fechaFin = hasta) {
    const valido = !!desde && !!fechaFin && desde <= fechaFin && (Date.parse(`${fechaFin}T00:00:00Z`) - Date.parse(`${desde}T00:00:00Z`)) / 86400000 <= 366;
    if (!valido) { setErrorRango("Seleccione un rango válido de hasta 367 días."); return; }
    setErrorRango("");
    setRango({ desde, hasta: fechaFin });
  }
  async function exportarPdf() {
    setExportando(true);
    setErrorExportacion("");
    try {
      const { generarReportePdf } = await import("./reportePdf");
      const empleado = empleados.datos?.find((fila) => String(fila.id) === personal);
      const nombre = general ? "Reporte general" : empleado ? `${empleado.nombres} ${empleado.apellidos}` : "Personal seleccionado";
      generarReportePdf(filas, rango.desde, rango.hasta, nombre).save(`asistencia_${rango.desde}_${rango.hasta}.pdf`);
    } catch {
      setErrorExportacion("No se pudo generar el archivo PDF.");
    } finally {
      setExportando(false);
    }
  }
  const filtros = <div className="reporte-filtros">
    <Field label="Personal"><Select value={personal} disabled={general || empleados.cargando || !!empleados.error} onChange={(e) => setPersonal(e.currentTarget.value)}><option value="">Seleccionar personal</option>{(empleados.datos ?? []).map((empleado) => <option key={empleado.id} value={empleado.id}>{empleado.nombres} {empleado.apellidos}</option>)}</Select></Field>
    <label className="reporte-general"><input type="checkbox" checked={general} onChange={(e) => { setGeneral(e.currentTarget.checked); if (e.currentTarget.checked) setPersonal(""); }} /> Reporte general</label>
    <Button type="button" variant="secondary" disabled={!filas.length || reporte.cargando || !!reporte.error || exportando} onClick={() => void exportarPdf()}><FileText size={16} /> {exportando ? "Exportando..." : "PDF"}</Button>
    <div className="reporte-fechas"><Field label="Fecha inicio"><TextInput type="date" value={desde} onChange={(e) => { setDesde(e.currentTarget.value); setErrorRango(""); }} /></Field><Field label="Fecha fin"><TextInput type="date" value={hasta} onChange={(e) => { const fecha = e.currentTarget.value; setHasta(fecha); if (fecha) buscar(fecha); }} /></Field><Button type="button" onClick={() => buscar()} aria-label="Buscar asistencia" title="Buscar"><Search size={18} aria-hidden="true" /></Button></div>
  </div>;
  return <>
    <ErrorVista mensaje={errorExportacion || empleados.error || reporte.error || errorRango} cerrar={() => { setErrorExportacion(""); setErrorRango(""); }} />
    <div className="reporte">
      <DataTable columns={columnas} data={filas} filterKeys={[]} storageKey="reporte-asistencia" showSearch={false} searchAction={filtros} loading={reporte.cargando} initialPageSize={50} resetPageOn={`${rango.desde}|${rango.hasta}|${personal}|${general}`} emptyMessage={!general && !personal ? "Selecciona un personal para consultar el reporte." : "No hay asistencias para los filtros seleccionados."} />
    </div>
  </>;
}
