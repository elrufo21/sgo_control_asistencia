// Adaptado de sgo_dnx_frontend/src/components/DataTable.tsx.
import { useDeferredValue, useEffect, useMemo, useState, type ReactNode } from "react";
import { flexRender, getCoreRowModel, getPaginationRowModel, useReactTable, type ColumnDef, type PaginationState } from "@tanstack/react-table";
import { Search, X, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from "lucide-react";
import TextInput from "./TextInput";
import { matchesSearch } from "./tableSearch";
import "./listado.css";

const sizes = [10, 20, 50, 100];
function storedValue(storage: Storage, key: string, fallback: string) {
  try { return storage.getItem(key) ?? fallback; } catch { return fallback; }
}
function saveValue(storage: Storage, key: string, value: string) {
  try { if (value) storage.setItem(key, value); else storage.removeItem(key); } catch { /* Almacenamiento no disponible. */ }
}

export default function DataTable<T extends object>({ columns, data, filterKeys, storageKey, title, filters, action, loading = false, emptyMessage = "No hay datos para mostrar.", emptyContent, showSearch = true, showPagination = true, persistSearch = true, resetPageOn }: {
  columns: ColumnDef<T, unknown>[];
  data: T[];
  filterKeys: readonly (keyof T & string)[];
  storageKey: string;
  title?: string;
  filters?: ReactNode;
  action?: ReactNode;
  loading?: boolean;
  emptyMessage?: string;
  emptyContent?: ReactNode;
  showSearch?: boolean;
  showPagination?: boolean;
  persistSearch?: boolean;
  resetPageOn?: unknown;
}) {
  const searchKey = `asistencia:datatable:search:${storageKey}`;
  const sizeKey = `asistencia:datatable:pageSize:${storageKey}`;
  const [search, setSearch] = useState(() => showSearch && persistSearch ? storedValue(sessionStorage, searchKey, "") : "");
  const [pagination, setPagination] = useState<PaginationState>(() => {
    const size = Number(storedValue(localStorage, sizeKey, "10"));
    return { pageIndex: 0, pageSize: showPagination && sizes.includes(size) ? size : 10 };
  });
  const deferredSearch = useDeferredValue(search);
  const filtered = useMemo(() => !showSearch || !deferredSearch.trim() ? data : data.filter((row) => matchesSearch(row as Record<string, unknown>, filterKeys, deferredSearch)), [data, filterKeys, deferredSearch, showSearch]);
  const table = useReactTable({ data: filtered, columns, state: { pagination }, onPaginationChange: setPagination, getCoreRowModel: getCoreRowModel(), getPaginationRowModel: getPaginationRowModel(), autoResetPageIndex: false });
  const totalPages = Math.max(1, Math.ceil(filtered.length / pagination.pageSize));
  useEffect(() => { setPagination((p) => ({ ...p, pageIndex: 0 })); }, [deferredSearch, resetPageOn]);
  useEffect(() => { setPagination((p) => p.pageIndex >= totalPages ? { ...p, pageIndex: totalPages - 1 } : p); }, [totalPages]);
  useEffect(() => { if (showSearch && persistSearch) saveValue(sessionStorage, searchKey, search); }, [search, searchKey, showSearch, persistSearch]);
  useEffect(() => { if (showPagination) saveValue(localStorage, sizeKey, String(pagination.pageSize)); }, [pagination.pageSize, sizeKey, showPagination]);
  const visibleRows = showPagination ? table.getRowModel().rows : table.getCoreRowModel().rows;
  const start = filtered.length ? pagination.pageIndex * pagination.pageSize + 1 : 0;
  const end = Math.min(start + visibleRows.length - (start ? 1 : 0), filtered.length);

  return <section className="panel data-table">
    {(title || showSearch || action || filters) && <div className="data-table-toolbar">
      <div className="data-table-toolbar-row">
        <div className="data-table-primary">
          {showSearch && <div className="search data-table-search"><Search size={18} aria-hidden="true" /><TextInput aria-label="Buscar registros" placeholder="Buscar en la tabla..." value={search} onChange={(e) => setSearch(e.currentTarget.value)} />{search && <button type="button" className="icon-button" aria-label="Limpiar búsqueda" onClick={() => setSearch("")}><X size={16} /></button>}</div>}
          {action && <div className="data-table-action">{action}</div>}
        </div>
        {filters && <div className="data-table-filters">{filters}</div>}
      </div>
    </div>}
    <div className="table-wrap data-table-scroll">
      <table className="admin-table">
        <thead>{table.getHeaderGroups().map((group) => <tr key={group.id}>{group.headers.map((header) => <th key={header.id} scope="col" className={header.column.id === "acciones" ? "actions" : undefined}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</th>)}</tr>)}</thead>
        <tbody>{!loading && visibleRows.map((row) => <tr key={row.id}>{row.getVisibleCells().map((cell) => <td key={cell.id} data-label={typeof cell.column.columnDef.header === "string" ? cell.column.columnDef.header : ""} className={cell.column.id === "acciones" ? "actions" : undefined}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}</tr>)}</tbody>
      </table>
      {loading ? <div className="data-table-empty" role="status">Cargando registros...</div> : !visibleRows.length && (emptyContent || <div className="data-table-empty">{emptyMessage}</div>)}
    </div>
    {showPagination && <footer className="data-table-footer">
      <div className="data-table-footer-group"><label>Filas por página: <select aria-label="Filas por página" value={pagination.pageSize} onChange={(e) => setPagination({ pageIndex: 0, pageSize: Number(e.target.value) })}>{sizes.map((size) => <option value={size} key={size}>{size}</option>)}</select></label><span>{start}–{end} de {filtered.length}</span></div>
      <div className="data-table-footer-group"><span>Página {Math.min(pagination.pageIndex + 1, totalPages)} de {totalPages}</span><button type="button" aria-label="Primera página" disabled={pagination.pageIndex <= 0} onClick={() => table.setPageIndex(0)}><ChevronsLeft size={16} /></button><button type="button" aria-label="Página anterior" disabled={pagination.pageIndex <= 0} onClick={() => table.previousPage()}><ChevronLeft size={16} /></button><button type="button" aria-label="Siguiente página" disabled={pagination.pageIndex >= totalPages - 1} onClick={() => table.nextPage()}><ChevronRight size={16} /></button><button type="button" aria-label="Última página" disabled={pagination.pageIndex >= totalPages - 1} onClick={() => table.setPageIndex(totalPages - 1)}><ChevronsRight size={16} /></button></div>
    </footer>}
  </section>;
}
