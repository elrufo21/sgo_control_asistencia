import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { listarAreasParaSeguridad } from "../../mantenimiento/areas/services/areasService";
import { mensajeError } from "../../../shared/api/http";
import { consultarPermisosArea, guardarPermisosArea, type Indicador } from "../services/seguridadService";
import { useConsulta } from "../../../shared/hooks/useConsulta";
import { Button, Field, Select } from "../../../components/Controls";
import { useConfirmacion } from "../../../components/Confirmacion";
import { ErrorVista } from "../../../components/Pagina";
import SearchInput from "../../../components/SearchInput";
import { normalizeSearchText } from "../../../components/tableSearch";
import { Toast } from "../../../components/Toast";
import { usePermisos } from "../../../shared/security/permisos";
import "../permisosArea.css";

type CampoPermiso = "permitido" | "crear" | "editar" | "eliminar";

export function PermisosAreaPage({ protegerSalida, actualizarSesion }: { protegerSalida: (verificar: (() => Promise<boolean>) | null) => void; actualizarSesion: () => Promise<void> }) {
  const areas = useConsulta(listarAreasParaSeguridad);
  const puedeEditar = usePermisos("seguridad").editar;
  const confirmar = useConfirmacion();
  const [area, setArea] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [matriz, setMatriz] = useState<Indicador[] | null>(null);
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [editado, setEditado] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  useEffect(() => {
    protegerSalida(async () => !guardando && (!editado || await confirmar({ titulo: "Cambios sin guardar", mensaje: "Si sales ahora perderás los cambios de permisos.", confirmar: "Salir" })));
    return () => protegerSalida(null);
  }, [protegerSalida, editado, guardando, confirmar]);

  useEffect(() => {
    if (!area) { setMatriz(null); return; }
    const abortar = new AbortController();
    setMatriz(null); setCargando(true); setError(""); setExito("");
    consultarPermisosArea(area, abortar.signal)
      .then((datos) => { if (!abortar.signal.aborted) { setMatriz(datos); setEditado(false); } })
      .catch((e) => { if (!abortar.signal.aborted) setError(mensajeError(e)); })
      .finally(() => { if (!abortar.signal.aborted) setCargando(false); });
    return () => abortar.abort();
  }, [area]);

  async function cambiarArea(valor: string) {
    if (valor === area || guardando) return;
    if (editado && !(await confirmar({ titulo: "Cambios sin guardar", mensaje: "Si cambias de área perderás los cambios de permisos.", confirmar: "Cambiar de área" }))) return;
    setArea(valor);
  }
  function cambiarPermiso(codigo: string, campo: CampoPermiso, valor: boolean) {
    setMatriz((actual) => actual?.map((fila) => fila.codigo !== codigo ? fila : campo === "permitido" && !valor ? { ...fila, permitido: false, crear: false, editar: false, eliminar: false } : { ...fila, [campo]: valor }) ?? null);
    setEditado(true); setExito("");
  }
  async function guardar() {
    if (!area || !matriz || guardando) return;
    setGuardando(true); setError(""); setExito("");
    try {
      await guardarPermisosArea(area, matriz);
      setEditado(false); setExito("Permisos por área guardados.");
      try { await actualizarSesion(); } catch { setExito(""); setError("Los permisos se guardaron, pero no se pudo actualizar la sesión. Vuelva a iniciar sesión."); }
    } catch (e) { setError(mensajeError(e)); }
    finally { setGuardando(false); }
  }
  const areaSeleccionada = areas.datos?.find((fila) => String(fila.id) === area);
  const visibles = (matriz ?? []).filter((fila) => normalizeSearchText(fila.nombre).includes(normalizeSearchText(busqueda)));
  const todos = !!matriz?.length && matriz.every((fila) => fila.permitido && (!fila.permiteCrear || fila.crear) && (!fila.permiteEditar || fila.editar) && (!fila.permiteEliminar || fila.eliminar));
  return <>
    <ErrorVista mensaje={error || areas.error} cerrar={() => setError("")} />
    <Toast key={exito} mensaje={exito} tipo="exito" cerrar={() => setExito("")} />
    <div className="permisos-area-titulo"><h1>Permisos por área</h1></div>
    <section className="panel permisos-area-panel">
      <Field label="Área"><Select value={area} disabled={guardando || areas.cargando} onChange={(e) => void cambiarArea(e.currentTarget.value)}><option value="">Seleccione área</option>{(areas.datos ?? []).map((fila) => <option key={fila.id} value={fila.id}>{fila.nombre}</option>)}</Select></Field>
      {areaSeleccionada && <div className="permisos-area-seleccion">Área seleccionada: <strong>{areaSeleccionada.nombre}</strong></div>}
      <div className="permisos-area-filtros"><SearchInput aria-label="Buscar módulo en permisos" placeholder="Buscar módulo..." value={busqueda} onChange={(e) => setBusqueda(e.currentTarget.value)} onClear={() => setBusqueda("")} /><label><input type="checkbox" checked={todos} disabled={!puedeEditar || !matriz || guardando} onChange={(e) => { const valor = e.currentTarget.checked; setMatriz((actual) => actual?.map((fila) => ({ ...fila, permitido: valor, crear: valor && fila.permiteCrear, editar: valor && fila.permiteEditar, eliminar: valor && fila.permiteEliminar })) ?? null); setEditado(true); setExito(""); }} /> Seleccionar todos los módulos</label></div>
      <div className="permisos-area-scroll"><table><thead><tr><th scope="col">Módulo</th><th scope="col">Permitido</th><th scope="col">Edición</th><th scope="col">Creación</th><th scope="col">Eliminación</th></tr></thead><tbody>
        {visibles.map((fila) => <tr key={fila.codigo}><th scope="row">{fila.nombre}</th>{(["permitido", "editar", "crear", "eliminar"] as const).map((campo) => { const aplicable = campo === "permitido" || (campo === "crear" ? fila.permiteCrear : campo === "editar" ? fila.permiteEditar : fila.permiteEliminar); return <td key={campo}>{aplicable ? <input type="checkbox" aria-label={`${campo} ${fila.nombre}`} checked={fila[campo]} disabled={!puedeEditar || guardando || (campo !== "permitido" && !fila.permitido)} onChange={(e) => cambiarPermiso(fila.codigo, campo, e.currentTarget.checked)} /> : <span aria-label="No aplica">—</span>}</td>; })}</tr>)}
        {!visibles.length && <tr><td colSpan={5} className="permisos-area-vacio">{cargando ? "Cargando permisos..." : !area ? "Seleccione un área para configurar sus permisos." : matriz ? "No hay módulos para la búsqueda." : "No se pudieron cargar los permisos."}</td></tr>}
      </tbody></table></div>
      {puedeEditar && <div className="permisos-area-acciones"><Button type="button" onClick={() => void guardar()} disabled={!matriz || !editado || guardando}><Save size={16} /> {guardando ? "Guardando..." : "Guardar permisos"}</Button></div>}
    </section>
  </>;
}
