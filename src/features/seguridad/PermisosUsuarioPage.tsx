import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { cambiar, consultar, mensajeError } from "../../shared/api/http";
import { useConsulta } from "../../shared/hooks/useConsulta";
import { Button, Field, Select } from "../../shared/ui/Controls";
import { useConfirmacion } from "../../shared/ui/Confirmacion";
import { ErrorVista } from "../../shared/ui/Pagina";
import SearchInput from "../../shared/ui/SearchInput";
import { normalizeSearchText } from "../../shared/ui/tableSearch";
import { Toast } from "../../shared/ui/Toast";
import { usePermisos } from "../../shared/security/permisos";
import "./permisosArea.css";

type Campo = "permitido" | "editar" | "crear" | "eliminar";
type Fila = { codigo: string; nombre: string; permiteCrear: boolean; permiteEditar: boolean; permiteEliminar: boolean; permitido: boolean | null; editar: boolean | null; crear: boolean | null; eliminar: boolean | null; efectivoPermitido: boolean; efectivoEditar: boolean; efectivoCrear: boolean; efectivoEliminar: boolean };
type Usuario = { id: number; usuario: string; personal: string; area: string | null };
const listar = (signal: AbortSignal) => consultar<Usuario[]>("seguridad/usuarios", { signal });

export function PermisosUsuarioPage({ protegerSalida, actualizarSesion }: { protegerSalida: (verificar: (() => Promise<boolean>) | null) => void; actualizarSesion: () => Promise<void> }) {
  const usuarios = useConsulta(listar); const puedeEditar = usePermisos("seguridad").editar; const confirmar = useConfirmacion();
  const [usuario, setUsuario] = useState(""); const [matriz, setMatriz] = useState<Fila[] | null>(null); const [busqueda, setBusqueda] = useState("");
  const [editado, setEditado] = useState(false); const [guardando, setGuardando] = useState(false); const [error, setError] = useState(""); const [exito, setExito] = useState("");
  useEffect(() => { protegerSalida(async () => !guardando && (!editado || await confirmar({ titulo: "Cambios sin guardar", mensaje: "Si sales perderás los cambios de permisos.", confirmar: "Salir" }))); return () => protegerSalida(null); }, [protegerSalida, guardando, editado, confirmar]);
  useEffect(() => { if (!usuario) { setMatriz(null); return; } const control = new AbortController(); setMatriz(null); setError(""); setExito(""); consultar<Fila[]>(`seguridad/usuarios/${usuario}/permisos`, { signal: control.signal }).then((filas) => { if (!control.signal.aborted) { setMatriz(filas); setEditado(false); } }).catch((e) => { if (!control.signal.aborted) setError(mensajeError(e)); }); return () => control.abort(); }, [usuario]);
  async function seleccionar(valor: string) { if (valor === usuario || guardando) return; if (editado && !(await confirmar({ titulo: "Cambios sin guardar", mensaje: "Si cambias de usuario perderás los cambios.", confirmar: "Cambiar" }))) return; setUsuario(valor); }
  async function guardar() { if (!matriz || !usuario || guardando) return; setGuardando(true); setError(""); setExito(""); try { await cambiar(`seguridad/usuarios/${usuario}/permisos`, "PUT", { permisos: matriz.map(({ codigo, permitido, editar, crear, eliminar }) => ({ codigo, permitido, editar, crear, eliminar })) }); setEditado(false); setExito("Permisos por usuario guardados."); await actualizarSesion(); } catch (e) { setExito(""); setError(mensajeError(e)); } finally { setGuardando(false); } }
  const visibles = (matriz ?? []).filter((fila) => normalizeSearchText(fila.nombre).includes(normalizeSearchText(busqueda)));
  return <><ErrorVista mensaje={error || usuarios.error} cerrar={() => setError("")} /><Toast key={exito} mensaje={exito} tipo="exito" cerrar={() => setExito("")} /><div className="permisos-area-titulo"><h1>Permisos por usuario</h1></div><section className="panel permisos-area-panel">
    <Field label="Usuario"><Select value={usuario} disabled={guardando || usuarios.cargando} onChange={(e) => void seleccionar(e.currentTarget.value)}><option value="">Seleccione usuario</option>{(usuarios.datos ?? []).map((u) => <option key={u.id} value={u.id}>{u.usuario} · {u.personal} · {u.area ?? "Sin área"}</option>)}</Select></Field>
    <p>Los permisos individuales tienen prioridad. «Heredar» usa el permiso del área.</p>
    <SearchInput aria-label="Buscar módulo en permisos" placeholder="Buscar módulo..." value={busqueda} onChange={(e) => setBusqueda(e.currentTarget.value)} onClear={() => setBusqueda("")} />
    <div className="permisos-area-scroll"><table><thead><tr><th>Módulo</th><th>Permitido</th><th>Edición</th><th>Creación</th><th>Eliminación</th></tr></thead><tbody>{visibles.map((fila) => <tr key={fila.codigo}><th scope="row">{fila.nombre}</th>{(["permitido", "editar", "crear", "eliminar"] as Campo[]).map((campo) => { const aplicable = campo === "permitido" || (campo === "editar" ? fila.permiteEditar : campo === "crear" ? fila.permiteCrear : fila.permiteEliminar); return <td key={campo}>{aplicable ? <select aria-label={`${campo} ${fila.nombre}`} disabled={!puedeEditar || guardando} value={fila[campo] === null ? "heredar" : fila[campo] ? "permitir" : "denegar"} onChange={(e) => { const valor = e.currentTarget.value; setMatriz((actual) => actual?.map((f) => f.codigo === fila.codigo ? { ...f, [campo]: valor === "heredar" ? null : valor === "permitir" } : f) ?? null); setEditado(true); setExito(""); }}><option value="heredar">Heredar</option><option value="permitir">Permitir</option><option value="denegar">Denegar</option></select> : "—"}</td>; })}</tr>)}{!visibles.length && <tr><td colSpan={5} className="permisos-area-vacio">{usuario ? "No hay módulos para mostrar." : "Seleccione un usuario para configurar sus permisos."}</td></tr>}</tbody></table></div>
    {puedeEditar && <div className="permisos-area-acciones"><Button type="button" disabled={!matriz || !editado || guardando} onClick={() => void guardar()}><Save size={16} /> {guardando ? "Guardando..." : "Guardar permisos"}</Button></div>}
  </section></>;
}
