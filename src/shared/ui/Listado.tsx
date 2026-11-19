import { useMemo, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import DataTable from "./DataTable";
import { formatoFecha } from "../formatoFecha";

export type Columna<Fila> = readonly [keyof Fila, string];

export function Listado<Fila extends { id: number }>({ titulo, icono: Icono, filas, columnas, cargando, filtros, acciones, accionCabecera, resetPageOn, mantenimiento, volver }: {
  titulo: string;
  icono: LucideIcon;
  filas: Fila[];
  columnas: readonly Columna<Fila>[];
  cargando: boolean;
  filtros?: ReactNode;
  acciones?: (fila: Fila) => ReactNode;
  accionCabecera?: ReactNode;
  resetPageOn?: unknown;
  mantenimiento?: boolean;
  volver?: () => void;
}) {
  const filterKeys = useMemo(() => columnas.map(([key]) => String(key) as keyof Fila & string), [columnas]);
  const defs = useMemo<ColumnDef<Fila, unknown>[]>(() => {
    const cols: ColumnDef<Fila, unknown>[] = columnas.map(([clave, etiqueta]) => ({
      id: String(clave), header: etiqueta, accessorFn: (fila) => fila[clave],
      cell: ({ getValue }) => {
        const valor = String(getValue() ?? "") || "—";
        return clave === "estado" ? <span className={valor === "INACTIVO" ? "status inactive" : "status"}>{valor}</span> : clave === "fecha" ? formatoFecha(valor) : valor;
      },
    }));
    if (acciones) cols.push({ id: "acciones", header: "Acciones", cell: ({ row }) => acciones(row.original) });
    return cols;
  }, [columnas, acciones]);
  return <DataTable title={titulo} storageKey={titulo} columns={defs} data={filas} filterKeys={filterKeys} loading={cargando} filters={filtros} resetPageOn={resetPageOn} searchAction={accionCabecera} mantenimiento={mantenimiento} volver={volver} emptyContent={<div className="empty"><div className="empty-icon"><Icono size={27} /></div><strong>No hay registros para mostrar</strong><span>Prueba con otra búsqueda o modifica los filtros.</span></div>} />;
}
