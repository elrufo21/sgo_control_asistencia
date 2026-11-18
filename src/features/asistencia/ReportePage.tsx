import { useCallback, useState } from "react";
import { FileSpreadsheet } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { listarEmpleados } from "../empleados/api";
import { useConsulta } from "../../shared/hooks/useConsulta";
import { formatoFecha } from "../../shared/formatoFecha";
import { Button, Field, Select } from "../../shared/ui/Controls";
import DataTable from "../../shared/ui/DataTable";
import { ErrorVista } from "../../shared/ui/Pagina";
import TextInput from "../../shared/ui/TextInput";
import { consultarReporte, type FilaReporte } from "./api";
import "./reporte.css";

const dia = (fecha: string) => new Date(`${fecha}T12:00:00`).toLocaleDateString("es-PE", { weekday: "long" }).toLocaleUpperCase("es-PE");
const columnas: ColumnDef<FilaReporte, unknown>[] = [
  { accessorKey: "fecha", header: "Fecha", cell: ({ row }) => formatoFecha(row.original.fecha) },
  { id: "dia", header: "Día", cell: ({ row }) => dia(row.original.fecha) },
  { accessorKey: "empleado", header: "Nombres" },
  { accessorKey: "entrada", header: "Ingreso" },
  { accessorKey: "salidaRefrigerio", header: "Salida refrigerio", cell: ({ getValue }) => String(getValue() || "—") },
  { accessorKey: "retornoRefrigerio", header: "Retorno refrigerio", cell: ({ getValue }) => String(getValue() || "—") },
  { accessorKey: "salida", header: "Salida", cell: ({ getValue }) => String(getValue() || "—") },
  { accessorKey: "tardanzas", header: "N.º tardanzas" },
  { accessorKey: "estado", header: "Asistencia", cell: ({ row }) => <strong className={row.original.estado === "TARDANZA" ? "reporte-tardanza" : "reporte-asistencia"}>{row.original.estado}</strong> },
];
const hoy = () => new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Lima", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());

export function ReportePage() {
  const [desde, setDesde] = useState(hoy);
  const [hasta, setHasta] = useState(hoy);
  const [personal, setPersonal] = useState("");
  const [general, setGeneral] = useState(true);
  const [exportando, setExportando] = useState(false);
  const [errorExportacion, setErrorExportacion] = useState("");
  const empleados = useConsulta(listarEmpleados);
  const rangoValido = !!desde && !!hasta && desde <= hasta && (Date.parse(`${hasta}T00:00:00Z`) - Date.parse(`${desde}T00:00:00Z`)) / 86400000 <= 366;
  const consultar = useCallback((signal: AbortSignal) => rangoValido ? consultarReporte(desde, hasta, signal) : Promise.resolve([]), [desde, hasta, rangoValido]);
  const reporte = useConsulta(consultar);
  const filas = (rangoValido && (general || personal) ? reporte.datos ?? [] : []).filter((fila) => general || String(fila.personalId) === personal).sort((a, b) => a.fecha.localeCompare(b.fecha) || b.entrada.localeCompare(a.entrada));
  async function exportarExcel() {
    setExportando(true);
    setErrorExportacion("");
    try {
      const { default: ExcelJS } = await import("exceljs");
      const libro = new ExcelJS.Workbook();
      const hoja = libro.addWorksheet("Asistencia");
      hoja.addRow(["Fecha", "Día", "Nombres", "Ingreso", "Salida refrigerio", "Retorno refrigerio", "Salida", "N.º tardanzas", "Asistencia"]);
      filas.forEach((fila) => hoja.addRow([formatoFecha(fila.fecha), dia(fila.fecha), fila.empleado, fila.entrada, fila.salidaRefrigerio ?? "", fila.retornoRefrigerio ?? "", fila.salida ?? "", fila.tardanzas, fila.estado]));
      hoja.getRow(1).font = { bold: true };
      hoja.columns.forEach((columna, indice) => { columna.width = [14, 15, 32, 14, 21, 22, 14, 18, 16][indice]; });
      const archivo = await libro.xlsx.writeBuffer();
      const url = URL.createObjectURL(new Blob([archivo], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download = `asistencia_${desde}_${hasta}.xlsx`;
      enlace.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setErrorExportacion("No se pudo generar el archivo Excel.");
    } finally {
      setExportando(false);
    }
  }
  const filtros = <div className="reporte-filtros">
    <Field label="Personal"><Select value={personal} disabled={general || empleados.cargando || !!empleados.error} onChange={(e) => setPersonal(e.currentTarget.value)}><option value="">Seleccionar personal</option>{(empleados.datos ?? []).map((empleado) => <option key={empleado.id} value={empleado.id}>{empleado.nombres} {empleado.apellidos}</option>)}</Select></Field>
    <label className="reporte-general"><input type="checkbox" checked={general} onChange={(e) => { setGeneral(e.currentTarget.checked); if (e.currentTarget.checked) setPersonal(""); }} /> Reporte general</label>
    <Button type="button" variant="secondary" disabled={!filas.length || reporte.cargando || !!reporte.error || exportando} onClick={() => void exportarExcel()}><FileSpreadsheet size={16} /> {exportando ? "Exportando..." : "Excel"}</Button>
    <div className="reporte-fechas"><Field label="Fecha inicio"><TextInput type="date" value={desde} onChange={(e) => setDesde(e.currentTarget.value)} /></Field><Field label="Fecha fin"><TextInput type="date" value={hasta} onChange={(e) => setHasta(e.currentTarget.value)} /></Field></div>
  </div>;
  return <>
    <ErrorVista mensaje={errorExportacion || empleados.error || reporte.error || (!rangoValido ? "Seleccione un rango válido de hasta 367 días." : "")} />
    <div className="reporte">
      <DataTable columns={columnas} data={filas} filterKeys={[]} storageKey="reporte-asistencia" showSearch={false} searchAction={filtros} loading={reporte.cargando} initialPageSize={50} resetPageOn={`${desde}|${hasta}|${personal}|${general}`} emptyMessage={!general && !personal ? "Selecciona un personal para consultar el reporte." : "No hay asistencias para los filtros seleccionados."} />
    </div>
  </>;
}
