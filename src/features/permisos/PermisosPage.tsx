import { useCallback, useState, type FormEvent } from "react";
import { ClipboardList, Users } from "lucide-react";
import { cambiar, consultar, mensajeError } from "../../shared/api/http";
import { useConsulta } from "../../shared/hooks/useConsulta";
import { Button, Field } from "../../shared/ui/Controls";
import { ErrorVista } from "../../shared/ui/Pagina";
import TextInput from "../../shared/ui/TextInput";
import { Listado, type Columna } from "../../shared/ui/Listado";
import { formatoFecha } from "../../shared/formatoFecha";
import { enfocarCampo } from "../../shared/ui/ValidacionFormulario";
import { usePermisos } from "../../shared/security/permisos";

type Permiso = { id: number; personalId: number; empleado: string; fecha: string; estado: string; salida: string | null; retorno: string | null };
type PermisoFila = Permiso & { fechaMostrada: string; salidaMostrada: string; retornoMostrado: string };
type Resumen = { id: number; empleado: string; estado: string; limite: number | null; usado: number };
type ResumenFila = Resumen & { asignado: string; consumo: string; saldo: string; exceso: string };
type Auditoria = { id: number; usuario: string; fechaHora: string; motivo: string; salidaAnterior: string | null; retornoAnterior: string | null; salidaNueva: string; retornoNuevo: string };
type Respuesta = { resumen: Resumen[]; permisos: Permiso[] };
const columnasResumen: Columna<ResumenFila>[] = [["empleado", "Empleado"], ["estado", "Estado"], ["asignado", "Horas asignadas"], ["consumo", "Utilizado"], ["saldo", "Saldo"], ["exceso", "Exceso"]];
const columnasPermisos: Columna<PermisoFila>[] = [["empleado", "Empleado"], ["fechaMostrada", "Fecha"], ["estado", "Estado"], ["salidaMostrada", "Salida"], ["retornoMostrado", "Retorno"]];
const minutos = (n: number) => `${Math.floor(n / 60)} h ${n % 60} min`;
const hoy = () => new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Lima", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());

export function PermisosPage() {
  const puedeEditar = usePermisos("permisos").editar;
  const [mes, setMes] = useState(() => hoy().slice(0, 7));
  const [asignacion, setAsignacion] = useState<Resumen | null>(null);
  const [horas, setHoras] = useState("");
  const [minutosExtra, setMinutosExtra] = useState("0");
  const [error, setError] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [historial, setHistorial] = useState<Auditoria[] | null>(null);
  const [corregir, setCorregir] = useState<Permiso | null>(null);
  const [salida, setSalida] = useState("");
  const [retorno, setRetorno] = useState("");
  const [razon, setRazon] = useState("");
  const cargar = useCallback((signal: AbortSignal) => consultar<Respuesta>(`permisos?mes=${mes}`, { signal }), [mes]);
  const permisos = useConsulta(cargar);
  const ejecutar = async (accion: () => Promise<void>) => {
    setOcupado(true); setError("");
    try { await accion(); permisos.recargar(); } catch (e) { setError(mensajeError(e)); } finally { setOcupado(false); }
  };
  function abrirAsignacion(fila: Resumen) {
    setAsignacion(fila); setHoras(fila.limite === null ? "" : String(Math.floor(fila.limite / 60))); setMinutosExtra(String((fila.limite ?? 0) % 60)); setError("");
  }
  function guardarAsignacion(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!asignacion) return;
    const total = Number(horas) * 60 + Number(minutosExtra);
    if (!Number.isInteger(total) || total < 0 || total > 44640) { setError("Indique una cantidad válida de horas y minutos."); enfocarCampo(e.currentTarget.querySelector('input[type="number"]')); return; }
    void ejecutar(async () => { await cambiar(`permisos/asignaciones/${asignacion.id}`, "PUT", { mes, minutos: total }); setAsignacion(null); });
  }
  const resumen: ResumenFila[] = (permisos.datos?.resumen ?? []).map((p) => ({ ...p, asignado: p.limite === null ? "Sin asignar" : minutos(p.limite), consumo: minutos(p.usado), saldo: p.limite === null ? "Sin asignar" : minutos(Math.max(0, p.limite - p.usado)), exceso: p.limite === null ? "Sin asignar" : minutos(Math.max(0, p.usado - p.limite)) }));
  const marcaciones: PermisoFila[] = (permisos.datos?.permisos ?? []).map((p) => ({ ...p, fechaMostrada: formatoFecha(p.fecha), salidaMostrada: formatoFecha(p.salida), retornoMostrado: formatoFecha(p.retorno) }));
  return <>
    <ErrorVista mensaje={error || permisos.error} cerrar={() => setError("")} />
    <h2 style={{ marginBottom: 12 }}>Horas mensuales por empleado</h2>
    <Listado titulo="Horas mensuales por empleado" icono={Users} filas={resumen} columnas={columnasResumen} cargando={permisos.cargando} filtros={<div className="filters"><Field label="Mes"><TextInput type="month" value={mes} onChange={(e) => setMes(e.currentTarget.value)} /></Field></div>} resetPageOn={mes} acciones={puedeEditar ? (fila) => <Button type="button" variant="secondary" onClick={() => abrirAsignacion(fila)}>Asignar horas</Button> : undefined} />
    <h2 style={{ margin: "24px 0 12px" }}>Marcaciones de permiso del mes</h2>
    <Listado titulo="Marcaciones de permiso del mes" icono={ClipboardList} filas={marcaciones} columnas={columnasPermisos} cargando={permisos.cargando} resetPageOn={mes} acciones={(p) => <div className="listado-controles">
      {puedeEditar && (p.estado === "EN_CURSO" || p.estado === "FINALIZADO") && <Button type="button" variant="secondary" onClick={() => { setCorregir(p); setSalida(p.salida?.slice(0, 16) ?? ""); setRetorno(p.retorno?.slice(0, 16) ?? ""); setRazon(""); }}>Corregir</Button>}
      <Button type="button" variant="secondary" onClick={() => void (async () => { try { setHistorial(await consultar<Auditoria[]>(`permisos/${p.id}/historial`)); } catch (e) { setError(mensajeError(e)); } })()}>Historial</Button>
    </div>} />
    {asignacion && <div className="overlay"><div className="dialog" role="dialog" aria-modal="true" aria-labelledby="asignacion-titulo"><div className="dialog-head"><h2 id="asignacion-titulo">Horas mensuales de {asignacion.empleado}</h2></div><form onSubmit={guardarAsignacion}><div className="form-grid" style={{ padding: 20 }}><p>La asignación será vigente desde {mes} y continuará en los meses siguientes hasta que se cambie.</p><Field label="Horas"><TextInput type="number" min="0" max="744" step="1" required value={horas} onChange={(e) => setHoras(e.currentTarget.value)} /></Field><Field label="Minutos"><TextInput type="number" min="0" max="59" step="1" required value={minutosExtra} onChange={(e) => setMinutosExtra(e.currentTarget.value)} /></Field></div><div className="dialog-actions"><Button type="button" variant="secondary" onClick={() => setAsignacion(null)}>Cerrar</Button><Button type="submit" disabled={ocupado}>Guardar asignación</Button></div></form></div></div>}
    {historial && <div className="overlay"><div className="dialog" role="dialog" aria-modal="true" aria-label="Historial de correcciones"><div className="dialog-head"><h2>Historial de correcciones</h2></div><div style={{ padding: 20, maxHeight: "60vh", overflow: "auto" }}>{historial.length === 0 ? <p>No hay correcciones.</p> : historial.map((h) => <p key={h.id} style={{ marginBottom: 12 }}><strong>{h.usuario} · {formatoFecha(h.fechaHora)}</strong><br />{h.motivo}<br />Anterior: {formatoFecha(h.salidaAnterior)} / {formatoFecha(h.retornoAnterior)}<br />Nuevo: {formatoFecha(h.salidaNueva)} / {formatoFecha(h.retornoNuevo)}</p>)}</div><div className="dialog-actions"><Button type="button" onClick={() => setHistorial(null)}>Cerrar</Button></div></div></div>}
    {corregir && <div className="overlay"><div className="dialog" role="dialog" aria-modal="true" aria-labelledby="corregir-titulo"><div className="dialog-head"><h2 id="corregir-titulo">Corregir permiso de {corregir.empleado}</h2></div><form onSubmit={(e) => { e.preventDefault(); void ejecutar(async () => { await cambiar(`permisos/${corregir.id}/corregir`, "PUT", { salida, retorno, motivo: razon }); setCorregir(null); }); }}><div className="form-grid" style={{ padding: 20 }}><Field label="Salida"><TextInput type="datetime-local" required value={salida} onChange={(e) => setSalida(e.currentTarget.value)} /></Field><Field label="Retorno"><TextInput type="datetime-local" required value={retorno} onChange={(e) => setRetorno(e.currentTarget.value)} /></Field><Field label="Motivo de corrección"><TextInput required maxLength={500} value={razon} onChange={(e) => setRazon(e.currentTarget.value)} /></Field></div><div className="dialog-actions"><Button type="button" variant="secondary" onClick={() => setCorregir(null)}>Cerrar</Button><Button type="submit" disabled={ocupado}>Guardar corrección</Button></div></form></div></div>}
  </>;
}
