import type { Estado } from "../api/catalogo";
import { Select } from "./Controls";

export type FiltroEstadoValor = "" | Estado;

export function FiltroEstado({ value, onChange }: { value: FiltroEstadoValor; onChange: (value: FiltroEstadoValor) => void }) {
  return <div className="filters"><div className="field"><Select aria-label="Estado" value={value} onChange={(event) => onChange(event.target.value as FiltroEstadoValor)}><option value="">Todos</option><option value="ACTIVO">Activos</option><option value="INACTIVO">Inactivos</option></Select></div></div>;
}
