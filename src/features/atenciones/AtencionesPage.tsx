import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { ClipboardList, Fingerprint } from "lucide-react";
import { cambiar, consultar, mensajeError } from "../../shared/api/http";
import { registrarAtencionLocal, usaLectorLocal } from "../../shared/api/lectorLocal";
import { formatoFecha } from "../../shared/formatoFecha";
import { useConsulta } from "../../shared/hooks/useConsulta";
import { Button, Field, Select } from "../../shared/ui/Controls";
import { Listado, type Columna } from "../../shared/ui/Listado";
import { ErrorVista } from "../../shared/ui/Pagina";
import TextInput from "../../shared/ui/TextInput";
import { listarEmpleados } from "../empleados/api";
import "./atenciones.css";

type Atencion = { id: number; personalId: number; profesional: string; pacienteDocumento: string; pacienteNombre: string; inicio: string; fin: string | null; duracionSegundos: number | null; detalle: string | null; metodoInicio: string; metodoFin: string | null };
type Fila = Atencion & { inicioTexto: string; finTexto: string; duracion: string; estado: string; identificacion: string };
type Auditoria = { id: number; usuario: string; fechaHora: string; motivo: string; inicioAnterior: string; finAnterior: string; inicioNuevo: string; finNuevo: string };
const columnas: Columna<Fila>[] = [["profesional", "Profesional"], ["pacienteNombre", "Paciente"], ["pacienteDocumento", "Documento"], ["inicioTexto", "Inicio"], ["finTexto", "Fin"], ["duracion", "Duración"], ["estado", "Estado"], ["identificacion", "Identificación"]];
const cargarAtenciones = (signal: AbortSignal) => consultar<Atencion[]>("atenciones", { signal, cache: "no-store" });
const duracionTexto = (segundos: number | null) => segundos === null ? "—" : `${Math.floor(segundos / 3600)} h ${Math.floor(segundos % 3600 / 60)} min ${segundos % 60} s`;

export function AtencionesPage({ esAdmin }: { esAdmin: boolean }) {
  const listado = useConsulta(cargarAtenciones);
  const cargarEmpleados = useCallback((signal: AbortSignal) => esAdmin ? listarEmpleados(signal) : Promise.resolve([]), [esAdmin]);
  const empleados = useConsulta(cargarEmpleados);
  const [accion, setAccion] = useState<"INICIAR" | "FINALIZAR">("INICIAR");
  const [documento, setDocumento] = useState("");
  const [paciente, setPaciente] = useState("");
  const [detalle, setDetalle] = useState("");
  const [fecha, setFecha] = useState("");
  const [prueba, setPrueba] = useState(false);
  const [codigo, setCodigo] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");
  const [seleccionada, setSeleccionada] = useState<Atencion | null>(null);
  const [historial, setHistorial] = useState<Auditoria[] | null>(null);
  const [inicio, setInicio] = useState("");
  const [fin, setFin] = useState("");
  const [motivo, setMotivo] = useState("");
  const control = useRef<AbortController | null>(null);
  useEffect(() => () => control.current?.abort(), []);

  async function registrar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault(); if (ocupado) return;
    const datos = { accion, pacienteDocumento: documento, pacienteNombre: paciente, detalle, codigo };
    const abortar = new AbortController(); control.current = abortar;
    setOcupado(true); setError(""); setAviso("");
    try {
      const resultado = prueba
        ? await consultar<{ mensaje: string }>("atenciones/prueba", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos), signal: abortar.signal })
        : usaLectorLocal
          ? await registrarAtencionLocal<{ mensaje: string }>(abortar.signal, datos)
          : await consultar<{ mensaje: string }>("lector/atencion", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos), signal: abortar.signal });
      setAviso(resultado.mensaje); setDocumento(""); setPaciente(""); setDetalle(""); listado.recargar();
    } catch (e) { if (!abortar.signal.aborted) setError(mensajeError(e)); }
    finally { if (!abortar.signal.aborted) setOcupado(false); control.current = null; }
  }

  async function corregir(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault(); if (!seleccionada || ocupado) return;
    setOcupado(true); setError("");
    try {
      await cambiar(`atenciones/${seleccionada.id}/corregir`, "PUT", { inicio, fin, motivo });
      setSeleccionada(null); setAviso("Corrección guardada."); listado.recargar();
    } catch (e) { setError(mensajeError(e)); } finally { setOcupado(false); }
  }

  const filas: Fila[] = (listado.datos ?? []).filter((a) => !fecha || a.inicio.slice(0, 10) === fecha).map((a) => ({ ...a, inicioTexto: formatoFecha(a.inicio), finTexto: formatoFecha(a.fin), duracion: duracionTexto(a.duracionSegundos), estado: a.fin ? "Finalizada" : "En curso", identificacion: a.metodoInicio === "PRUEBA" || a.metodoFin === "PRUEBA" ? "Prueba" : "Huella" }));
  return <>
    <ErrorVista mensaje={error || listado.error || empleados.error} />
    {aviso && <p className="atencion-aviso" role="status">{aviso}</p>}
    <section className="panel atencion-registro">
      <h2>Registrar atención</h2>
      <div className="atencion-modos" role="group" aria-label="Acción de atención">
        <Button type="button" variant={accion === "INICIAR" ? undefined : "secondary"} onClick={() => { setAccion("INICIAR"); setError(""); }} disabled={ocupado}>Iniciar atención</Button>
        <Button type="button" variant={accion === "FINALIZAR" ? undefined : "secondary"} onClick={() => { setAccion("FINALIZAR"); setError(""); }} disabled={ocupado}>Finalizar atención</Button>
      </div>
      <form onSubmit={registrar}>
        <div className="form-grid">
          {accion === "INICIAR" ? <><Field label="Documento del paciente"><TextInput value={documento} onChange={(e) => setDocumento(e.currentTarget.value)} required maxLength={30} /></Field><Field label="Nombre del paciente"><TextInput value={paciente} onChange={(e) => setPaciente(e.currentTarget.value)} required maxLength={180} /></Field></> : <Field label="Atención realizada"><textarea value={detalle} onChange={(e) => setDetalle(e.currentTarget.value)} required maxLength={2000} rows={3} /></Field>}
          {esAdmin && <Field label="Identificación"><Select value={prueba ? "codigo" : "huella"} onChange={(e) => setPrueba(e.currentTarget.value === "codigo")}><option value="huella">Huella</option><option value="codigo">Código (solo pruebas)</option></Select></Field>}
          {prueba && <Field label="Código del empleado"><Select value={codigo} onChange={(e) => setCodigo(e.currentTarget.value)} required><option value="">Seleccione empleado</option>{(empleados.datos ?? []).filter((e) => e.estado === "ACTIVO").map((e) => <option key={e.id} value={e.id}>{e.id} · {e.nombres} {e.apellidos}</option>)}</Select></Field>}
        </div>
        {prueba && <p>El modo de prueba debe habilitarse en el backend y no verifica la identidad mediante huella.</p>}
        <Button type="submit" disabled={ocupado}>{!prueba && <Fingerprint size={18} />}{ocupado ? "Esperando identificación..." : accion === "INICIAR" ? "Identificar e iniciar" : "Identificar y finalizar"}</Button>
      </form>
    </section>
    <Listado titulo="Atenciones" icono={ClipboardList} filas={filas} columnas={columnas} cargando={listado.cargando} filtros={<div className="filters"><Field label="Fecha de inicio"><TextInput type="date" value={fecha} onChange={(e) => setFecha(e.currentTarget.value)} /></Field></div>} resetPageOn={fecha} acciones={(a) => <div className="listado-controles"><Button type="button" variant="secondary" onClick={() => { setInicio(a.inicio.slice(0,19)); setFin(a.fin?.slice(0,19) ?? ""); setMotivo(""); setSeleccionada(a); }}>Ver detalle</Button>{esAdmin && a.fin && <Button type="button" variant="secondary" onClick={() => void consultar<Auditoria[]>(`atenciones/${a.id}/historial`).then(setHistorial).catch((e) => setError(mensajeError(e)))}>Historial</Button>}</div>} />
    {seleccionada && <div className="overlay"><div className="dialog" role="dialog" aria-modal="true" aria-label="Detalle de atención"><div className="dialog-head"><h2>Detalle de atención</h2></div><div className="atencion-detalle"><p><strong>{seleccionada.pacienteNombre}</strong> · {seleccionada.pacienteDocumento}</p><p>{seleccionada.detalle || "Atención en curso."}</p><p>Inicio: {formatoFecha(seleccionada.inicio)} · Fin: {formatoFecha(seleccionada.fin)}</p></div>{esAdmin && seleccionada.fin && <form onSubmit={corregir}><div className="form-grid atencion-detalle"><Field label="Corregir inicio"><TextInput type="datetime-local" step="1" required value={inicio} onChange={(e) => setInicio(e.currentTarget.value)} /></Field><Field label="Corregir fin"><TextInput type="datetime-local" step="1" required value={fin} onChange={(e) => setFin(e.currentTarget.value)} /></Field><Field label="Motivo de corrección"><TextInput required maxLength={500} value={motivo} onChange={(e) => setMotivo(e.currentTarget.value)} /></Field></div><div className="dialog-actions"><Button type="submit" disabled={ocupado}>Guardar corrección</Button></div></form>}<div className="dialog-actions"><Button type="button" variant="secondary" onClick={() => { setSeleccionada(null); setInicio(""); setFin(""); setMotivo(""); }}>Cerrar</Button></div></div></div>}
    {historial && <div className="overlay"><div className="dialog" role="dialog" aria-modal="true" aria-label="Historial de correcciones"><div className="dialog-head"><h2>Historial de correcciones</h2></div><div className="atencion-detalle">{historial.length ? historial.map((h) => <p key={h.id}><strong>{h.usuario} · {formatoFecha(h.fechaHora)}</strong><br />{h.motivo}<br />Anterior: {formatoFecha(h.inicioAnterior)} / {formatoFecha(h.finAnterior)}<br />Nuevo: {formatoFecha(h.inicioNuevo)} / {formatoFecha(h.finNuevo)}</p>) : <p>No hay correcciones.</p>}</div><div className="dialog-actions"><Button type="button" onClick={() => setHistorial(null)}>Cerrar</Button></div></div></div>}
  </>;
}
