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
import { AppLayout } from "./AppLayout";
import type { Pagina } from "./navegacion";
import { ErrorVista } from "../shared/ui/Pagina";
import { mensajeError } from "../shared/api/http";
import { cerrarSesionLector } from "../shared/api/lectorLocal";

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
    lector: <LectorBiometrico esAdmin={sesion.rol === "ADMIN"} />,
    empleados: <EmpleadosPage protegerSalida={protegerSalida} />,
    usuarios: <UsuariosPage />,
    areas: <AreasPage />,
    feriados: <FeriadosPage />,
    turnos: <TurnosPage />,
    reporte: <ReportePage />,
    permisos: <PermisosPage />,
  };
  const paginaActual = sesion.rol === "ADMIN" ? pagina : "lector";

  return (
    <AppLayout
      sesion={sesion}
      pagina={paginaActual}
      navegar={navegar}
      salir={salir}
    >
      <ErrorVista mensaje={error} />
      {vistas[paginaActual]}
    </AppLayout>
  );
}
