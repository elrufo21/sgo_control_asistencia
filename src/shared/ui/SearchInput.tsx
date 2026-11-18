// Adaptado de SearchInput de SGO, sin dependencias de Tailwind.
import type { ComponentPropsWithoutRef } from "react";
import { Search, X } from "lucide-react";

export default function SearchInput({ value, onClear, ...props }: ComponentPropsWithoutRef<"input"> & { onClear?: () => void }) {
  return <div className="search data-table-search">
    <Search size={16} aria-hidden="true" />
    <input {...props} value={value} />
    {onClear && value && <button type="button" className="icon-button" aria-label="Limpiar búsqueda" disabled={props.disabled} onClick={onClear}><X size={16} /></button>}
  </div>;
}
