import { Fingerprint, Info, ShieldCheck } from "lucide-react";

import { Button } from "../../../components/Controls";
import type { ResultadoLector } from "../services/lectorService";
import { Toast } from "../../../components/Toast";

export default function PanelCaptura({
  estado,
  modo,
  onModoChange,
  mensaje,
  resultado,
  horaMarcacion,
  lectorNoDisponible,
  pausado,
  onCerrarMensaje,
}: {
  estado: string;
  modo: string;
  onModoChange: (modo: string) => void;
  mensaje: string;
  resultado: ResultadoLector | null;
  horaMarcacion: string;
  lectorNoDisponible: boolean;
  pausado: boolean;
  onCerrarMensaje: () => void;
}) {
  const noReconocida = mensaje.startsWith("Huella no reconocida.");
  return (
    <section
      className={
        "panel lector-captura" + (noReconocida ? " huella-no-reconocida" : "")
      }
      aria-labelledby="captura-titulo"
    >
      {mensaje && <Toast key={mensaje} mensaje={mensaje} cerrar={onCerrarMensaje} />}
      {!mensaje && resultado?.registrada && <Toast key={`${resultado.fechaHora}-${resultado.tipo}`} tipo="exito" mensaje={`${resultado.tipo} · ${horaMarcacion}${resultado.tipo === "ENTRADA" && resultado.jornada?.estado === "TARDE" ? " · TARDE" : ""}`} />}
      {!mensaje && resultado && !resultado.registrada && !resultado.tokenConfirmacion && resultado.mensaje && <Toast key={resultado.mensaje} mensaje={resultado.mensaje} cerrar={onCerrarMensaje} />}
      <div
        className="lector-modos"
        role="group"
        aria-label="Tipo de marcación"
        title={estado}
      >
        <Button
          type="button"
          variant={modo === "" ? undefined : "secondary"}
          aria-pressed={modo === ""}
          onClick={() => onModoChange("")}
        >
          Asistencia
        </Button>
        <Button
          type="button"
          variant={modo === "SALIDA" ? undefined : "secondary"}
          aria-pressed={modo === "SALIDA"}
          onClick={() => onModoChange("SALIDA")}
        >
          Salida por permiso
        </Button>
        <Button
          type="button"
          variant={modo === "RETORNO" ? undefined : "secondary"}
          aria-pressed={modo === "RETORNO"}
          onClick={() => onModoChange("RETORNO")}
        >
          Retorno de permiso
        </Button>
      </div>
      <div className="lector-huella-visual">
        <div className="lector-huella-anillo">
          <Fingerprint size={72} strokeWidth={1.25} />
        </div>
      </div>
      <h2 id="captura-titulo">
        {pausado
          ? "Selecciona el tipo de marcación"
          : noReconocida
            ? "Huella no reconocida"
            : lectorNoDisponible
              ? "No se detectó el lector de huella"
              : resultado
                ? resultado.registrada
                  ? "¡Marcación registrada!"
                  : "Personal identificado"
                : "Coloca tu dedo en el lector"}
      </h2>

      <div className="lector-aviso" aria-live="polite">
        {!mensaje && resultado?.tokenConfirmacion ? (
            <div className="lector-informacion" role="status">
              <Info size={17} /> {resultado.mensaje}
            </div>
        ) : !mensaje && !resultado ? (
          <div className="lector-ayuda">
            <ShieldCheck size={16} /> La lectura se realiza automáticamente
          </div>
        ) : null}
      </div>
    </section>
  );
}
