import { useEffect, useState } from "react";
import { Activity, ArrowLeft, CalendarDays, Clock3 } from "lucide-react";
import { Button } from "../../shared/ui/Controls";
import { marcarConLector, type ResultadoLector } from "./api";
import { ApiError, mensajeError } from "../../shared/api/http";
import TablaJornadas from "./TablaJornadas";
import FotoPersonal from "../../shared/ui/FotoPersonal";
import PanelCaptura from "./PanelCaptura";
import "./LectorBiometrico.css";

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

export default function LectorBiometrico({ onBack }: { onBack?: () => void }) {
  const [ahora, setAhora] = useState(() => new Date());
  const [resultado, setResultado] = useState<ResultadoLector | null>(null),
    [mensaje, setMensaje] = useState(""),
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
    if (!resultado) return;
    const timer = setTimeout(() => setResultado(null), 30000);
    return () => clearTimeout(timer);
  }, [resultado]);
  useEffect(() => {
    if (!visible) {
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
        const data = await marcarConLector(control.signal);
        if (!activo) return;
        setResultado(data);
        setMensaje("");
      } catch (error) {
        if (!activo || control?.signal.aborted) return;
        let mensaje = mensajeError(error);
        if (error instanceof ApiError && error.status === 403) {
          mensaje =
            "El lector solo está habilitado en la computadora del backend.";
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
  }, [visible]);
  const datos = resultado?.personal;
  const campos = [
    ["Código", datos?.codigo],
    ["Área", datos?.area],
    ["DNI", datos?.dni],
    ["Estado", datos?.estado],
  ];
  const horaMarcacion = resultado?.fechaHora?.slice(11, 19) || "";
  const estado = !visible
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
            mensaje={mensaje}
            resultado={resultado}
            horaMarcacion={horaMarcacion}
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
        />
      </div>
    </div>
  );
}
