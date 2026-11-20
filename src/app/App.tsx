import { useCallback, useEffect, useRef, useState } from "react";
import {
  consultarSesion,
  cerrarSesion,
  type Sesion,
} from "../features/auth/api";
import { LoginPage } from "../features/auth/LoginPage";
import { AreasPage } from "../features/areas/AreasPage";
import { PermisosPage } from "../features/permisos/PermisosPage";
import { ReportePage } from "../features/asistencia/ReportePage";
import { EmpleadosPage } from "../features/empleados/EmpleadosPage";
import { FeriadosPage } from "../features/feriados/FeriadosPage";
import LectorBiometrico from "../features/lector/LectorBiometrico";
import { TurnosPage } from "../features/turnos/TurnosPage";
import { UsuariosPage } from "../features/usuarios/UsuariosPage";
import { AtencionesPage } from "../features/atenciones/AtencionesPage";
import { MantenimientoPage } from "../features/mantenimiento/MantenimientoPage";
import { AppLayout } from "./AppLayout";
import type { Pagina } from "./navegacion";
import { ErrorVista } from "../shared/ui/Pagina";
import { mensajeError } from "../shared/api/http";
import { cerrarSesionLector } from "../shared/api/lectorLocal";
import { paginasDe } from "./navegacion";
import { PermisosSesion, tienePermiso } from "../shared/security/permisos";
import { SeguridadPage } from "../features/seguridad/SeguridadPage";

export function App() {
  const [sesion, setSesion] = useState<Sesion | null>();
  const [pagina, setPagina] = useState<Pagina>("lector");
  const [lectorPublico, setLectorPublico] = useState(false);
  const [error, setError] = useState("");
  const salida = useRef<(() => Promise<boolean>) | null>(null);
  const protegerSalida = useCallback((verificar: (() => Promise<boolean>) | null) => {
    salida.current = verificar;
  }, []);

  useEffect(() => {
    const control = new AbortController();
    consultarSesion(control.signal)
      .then((sesion) => {
        if (!control.signal.aborted) setSesion(sesion);
      })
      .catch(() => {
        if (!control.signal.aborted) setSesion(null);
      });
    return () => control.abort();
  }, []);

  async function navegar(destino: Pagina) {
    if (salida.current && !(await salida.current())) return;
    setError("");
    try { setSesion(await consultarSesion(new AbortController().signal)); }
    catch (error) { setError(mensajeError(error)); return; }
    setPagina(destino);
  }

  async function salir() {
    if (salida.current && !(await salida.current())) return;
    try {
      await cerrarSesion();
      cerrarSesionLector();
      setSesion(null);
      setPagina("lector");
      setError("");
    } catch (error) {
      setError(mensajeError(error));
    }
  }

  if (sesion === undefined)
    return <div className="login-page">Cargando...</div>;
  if (!sesion) {
    return lectorPublico ? (
      <LectorBiometrico onBack={() => setLectorPublico(false)} />
    ) : (
      <LoginPage onLogin={setSesion} onReader={() => setLectorPublico(true)} />
    );
  }

  const vistas = {
    mantenimiento: <MantenimientoPage sesion={sesion} navegar={navegar} />,
    seguridad: <SeguridadPage protegerSalida={protegerSalida} actualizarSesion={async () => setSesion(await consultarSesion(new AbortController().signal))} />,
    lector: <LectorBiometrico esAdmin />,
    atenciones: <AtencionesPage puedeEditar={tienePermiso(sesion,"atenciones","editar")} puedePrueba={tienePermiso(sesion,"atenciones","editar") && tienePermiso(sesion,"seguridad","editar") && tienePermiso(sesion,"empleados")} />,
    empleados: <EmpleadosPage protegerSalida={protegerSalida} volver={() => navegar("mantenimiento")} />,
    usuarios: <UsuariosPage volver={() => navegar("mantenimiento")} />,
    areas: <AreasPage volver={() => navegar("mantenimiento")} />,
    feriados: <FeriadosPage volver={() => navegar("mantenimiento")} />,
    turnos: <TurnosPage volver={() => navegar("mantenimiento")} />,
    reporte: <ReportePage />,
    permisos: <PermisosPage />,
  };
  const paginasPermitidas = paginasDe(sesion);
  const puedeMantenimiento = paginasPermitidas.some(({ id }) => ["empleados", "usuarios", "areas", "feriados", "turnos"].includes(id));
  const puedeVerPagina = pagina === "mantenimiento" ? puedeMantenimiento : paginasPermitidas.some(({ id }) => id === pagina);
  const paginaActual = puedeVerPagina ? pagina : paginasPermitidas[0]?.id ?? "lector";

  return (
    <PermisosSesion sesion={sesion}><AppLayout
      sesion={sesion}
      pagina={paginaActual}
      navegar={navegar}
      salir={salir}
    >
      <ErrorVista mensaje={error} cerrar={() => setError("")} />
      {paginasPermitidas.length ? vistas[paginaActual] : <p>No tienes módulos asignados. Contacta al administrador.</p>}
    </AppLayout></PermisosSesion>
  );
}
