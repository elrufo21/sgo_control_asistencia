import { useEffect, useState } from "react";
import { Activity, ArrowLeft, CalendarDays, Clock3 } from "lucide-react";
import { Button } from "../../../components/Controls";
import { confirmarMarcacion, consultarJornadasHoy, consultarPermisosHoy, marcarConLector, type Jornada, type PermisoLector, type ResultadoLector } from "../services/lectorService";
import { ApiError, mensajeError } from "../../../shared/api/http";
import { usaLectorLocal } from "../../../shared/api/lectorLocal";
import TablaJornadas from "../components/TablaJornadas";
import FotoPersonal from "../../../components/FotoPersonal";
import PanelCaptura from "../components/PanelCaptura";
import "../LectorBiometrico.css";

const fecha = new Intl.DateTimeFormat("es-PE", {
  timeZone: "America/Lima",
  weekday: "long",
  day: "2-digit",
  month: "long",
  year: "numeric",
});
const hora = new Intl.DateTimeFormat("es-PE", {
  timeZone: "America/Lima",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

export default function LectorBiometrico({ onBack, esAdmin = false }: { onBack?: () => void; esAdmin?: boolean }) {
  const [pendiente, setPendiente] = useState<string | null>(null);
  const [confirmando, setConfirmando] = useState(false);
  const [jornadas, setJornadas] = useState<Jornada[]>([]);
  const [permisos, setPermisos] = useState<PermisoLector[]>([]);
  const [errorPermisos, setErrorPermisos] = useState("");
  const [cargandoPermisos, setCargandoPermisos] = useState(false);
  const [errorJornadas, setErrorJornadas] = useState("");
  const [cargandoJornadas, setCargandoJornadas] = useState(false);
  const [revisionJornadas, setRevisionJornadas] = useState(0);
  const [ahora, setAhora] = useState(() => new Date());
  const [modo, setModo] = useState("");
  const [resultado, setResultado] = useState<ResultadoLector | null>(null),
    [mensaje, setMensaje] = useState(""),
    [lectorNoDisponible, setLectorNoDisponible] = useState(false),
    [leyendo, setLeyendo] = useState(false),
    [visible, setVisible] = useState(
      () => typeof document === "undefined" || !document.hidden,
    );
  useEffect(() => {
    const timer = setInterval(() => setAhora(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    const cambiar = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", cambiar);
    return () => document.removeEventListener("visibilitychange", cambiar);
  }, []);
  useEffect(() => {
    if (!visible) return;
    const timer = setInterval(() => setRevisionJornadas((revision) => revision + 1), 30000);
    return () => clearInterval(timer);
  }, [esAdmin, visible]);
  useEffect(() => {
    if (!visible) return;
    const control = new AbortController();
    setCargandoJornadas(true);
    consultarJornadasHoy(control.signal, esAdmin)
      .then((filas) => { if (!control.signal.aborted) { setJornadas(filas); setErrorJornadas(""); } })
      .catch((error: unknown) => { if (!control.signal.aborted) setErrorJornadas(mensajeError(error)); })
      .finally(() => { if (!control.signal.aborted) setCargandoJornadas(false); });
    setCargandoPermisos(true);
    consultarPermisosHoy(control.signal, esAdmin)
      .then((filas) => { if (!control.signal.aborted) { setPermisos(filas); setErrorPermisos(""); } })
      .catch((error: unknown) => { if (!control.signal.aborted) setErrorPermisos(mensajeError(error)); })
      .finally(() => { if (!control.signal.aborted) setCargandoPermisos(false); });
    return () => control.abort();
  }, [esAdmin, visible, revisionJornadas]);
  useEffect(() => {
    if (!modo || modo === "PAUSA") return;
    const timer = setTimeout(() => setModo("PAUSA"), 30000);
    return () => clearTimeout(timer);
  }, [modo]);
  useEffect(() => {
    if (!resultado) return;
    const timer = setTimeout(() => setResultado(null), 30000);
    return () => clearTimeout(timer);
  }, [resultado]);
  useEffect(() => {
    if (!visible || modo === "PAUSA" || pendiente) {
      setLeyendo(false);
      return;
    }
    let activo = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let control: AbortController | undefined;
    async function escuchar() {
      control = new AbortController();
      setLeyendo(true);
      let espera = 800;
      try {
        const data = await marcarConLector(control.signal, modo);
        if (!activo) return;
        setResultado(data);
        if (data.tokenConfirmacion) setPendiente(data.tokenConfirmacion);
        if (data.registrada) setRevisionJornadas((revision) => revision + 1);
        if (data.registrada && modo) setModo("PAUSA");
        setMensaje("");
        setLectorNoDisponible(false);
      } catch (error) {
        if (!activo || control?.signal.aborted) return;
        let mensaje = mensajeError(error);
        const noDisponible = (error instanceof ApiError && (error.status === 403 || (usaLectorLocal && error.status === 503))) ||
          (usaLectorLocal && mensaje.startsWith("No se detectó el lector de huella."));
        setLectorNoDisponible(noDisponible);
        if (error instanceof ApiError && error.status === 403) {
          mensaje =
            "Verifica la conexión y configuración del lector o contacta al administrador.";
        } else if (error instanceof ApiError && error.status === 429) {
          mensaje = "Demasiados intentos. Espere un momento.";
        }
        if (mensaje === "No se detectó una huella. Inténtelo nuevamente.")
          setMensaje("");
        else {
          setResultado(null);
          setMensaje(mensaje);
          espera = 5000;
        }
      } finally {
        if (activo) setLeyendo(false);
      }
      if (activo) timer = setTimeout(escuchar, espera);
    }
    escuchar();
    return () => {
      activo = false;
      clearTimeout(timer);
      control?.abort();
    };
  }, [visible, modo, esAdmin, pendiente]);
  useEffect(() => {
    if (!pendiente) return;
    const timer = setTimeout(() => { setPendiente(null); setModo("PAUSA"); setMensaje("La confirmación venció. Vuelve a marcar tu huella."); }, 30000);
    return () => clearTimeout(timer);
  }, [pendiente]);
  async function confirmar() {
    if (!pendiente || confirmando) return;
    setConfirmando(true);
    try {
      const marca = await confirmarMarcacion(pendiente, new AbortController().signal);
      setResultado((previo) => previo ? { ...previo, ...marca, tokenConfirmacion: null, mensaje: null } : previo);
      setRevisionJornadas((revision) => revision + 1);
      setMensaje("");
    } catch (error) { setMensaje(mensajeError(error)); }
    finally { setPendiente(null); setModo("PAUSA"); setConfirmando(false); }
  }
  function cancelarConfirmacion() { if (!confirmando) { setPendiente(null); setResultado(null); setModo("PAUSA"); } }
  const datos = resultado?.personal;
  const campos = [
    ["Código", datos?.codigo],
    ["Área", datos?.area],
    ["DNI", datos?.dni],
    ["Estado", datos?.estado],
  ];
  const horaMarcacion = resultado?.fechaHora?.slice(11, 19) || "";
  const estado = modo === "PAUSA"
    ? "Selecciona el tipo de marcación"
    : !visible
    ? "Lectura suspendida"
    : mensaje
      ? "Revisar lector"
      : leyendo
        ? "Esperando huella"
        : "Preparando lector";
  return (
    <div className={onBack ? "lector-publico" : ""}>
      {onBack && (
        <header className="lector-publico-header">
          <div className="lector-marca">
            <div className="brand-icon">
              <Activity size={22} />
            </div>
            <div>
              <strong>
                Asistencia<span>Salud</span>
              </strong>
              <small>CONTROL DE PERSONAL</small>
            </div>
          </div>
          <Button type="button" variant="secondary" onClick={onBack}>
            <ArrowLeft size={16} /> Volver al inicio de sesión
          </Button>
        </header>
      )}
      {pendiente && <div className="overlay" onKeyDown={(event) => { if (event.key === "Escape") cancelarConfirmacion(); }}>
        <div className="dialog" role="dialog" aria-modal="true" aria-labelledby="confirmacion-marcacion">
          <div className="dialog-head"><h2 id="confirmacion-marcacion">Confirmar marcación</h2></div>
          <div style={{ padding: "20px 25px" }}><p>{resultado?.personal.nombres}</p><p>{resultado?.mensaje}</p><p>Hora registrada: {resultado?.fechaHora.slice(11, 19)}</p></div>
          <div className="dialog-actions"><Button type="button" variant="secondary" disabled={confirmando} onClick={cancelarConfirmacion}>Cancelar</Button><Button type="button" disabled={confirmando} autoFocus onClick={() => void confirmar()}>{confirmando ? "Registrando..." : "Sí, marcar"}</Button></div>
        </div>
      </div>}
      <div className="lector-contenido">
        <div className="lector-cabecera">
          <div>
            <span className="lector-etiqueta">
              <CalendarDays size={15} /> FECHA DE HOY
            </span>
            <strong className="lector-fecha">{fecha.format(ahora)}</strong>
            <p>Control de asistencia del personal</p>
          </div>
          <div className="lector-hora" aria-label="Hora de Lima">
            <span>
              <Clock3 size={15} /> HORA DE LIMA
            </span>
            <strong>{hora.format(ahora)}</strong>
          </div>
        </div>
        <div className="lector-principal">
          <PanelCaptura
            estado={estado}
            modo={modo}
            onModoChange={setModo}
            pausado={modo === "PAUSA"}
            mensaje={mensaje}
            resultado={resultado}
            horaMarcacion={horaMarcacion}
            lectorNoDisponible={lectorNoDisponible}
            onCerrarMensaje={() => { setMensaje(""); setResultado((actual) => actual ? { ...actual, mensaje: null } : actual); }}
          />
          <section
            className="panel lector-identidad"
            aria-label="Datos del personal"
          >
            <div className="lector-identidad-layout">
              <div className="lector-identidad-info">
                <div className="lector-perfil">
                  <div>
                    <span>COLABORADOR</span>
                    <strong>
                      {datos?.nombres || "Esperando identificación"}
                    </strong>
                    <small>
                      {datos
                        ? "Identificación completada"
                        : "Los datos aparecerán al leer una huella."}
                    </small>
                  </div>
                </div>
                <dl className="lector-detalles">
                  {campos.map(([label, value]) => (
                    <div key={label}>
                      <dt>{label}</dt>
                      <dd>{value || "—"}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div className="lector-foto-columna">
                <FotoPersonal
                  className="lector-foto"
                  src={datos?.foto}
                  nombre={datos?.nombres}
                  iconSize={56}
                />
              </div>
            </div>
          </section>
        </div>
        <TablaJornadas
          jornada={resultado?.jornada}
          identificado={!!resultado}
          jornadas={jornadas}
          permisos={permisos}
          cargando={cargandoJornadas && jornadas.length === 0}
          cargandoPermisos={cargandoPermisos && permisos.length === 0}
          errorJornadas={errorJornadas}
          errorPermisos={errorPermisos}
        />
      </div>
    </div>
  );
}
