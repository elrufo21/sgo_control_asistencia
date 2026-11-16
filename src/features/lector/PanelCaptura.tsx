import { CheckCircle2, Fingerprint, Info, ShieldCheck } from "lucide-react";

import { Button } from "../../shared/ui/Controls";
import type { ResultadoLector } from "./api";

export default function PanelCaptura({
  estado,
  modo,
  onModoChange,
  mensaje,
  resultado,
  horaMarcacion,
  lectorNoDisponible,
  pausado,
}: {
  estado: string;
  modo: string;
  onModoChange: (modo: string) => void;
  mensaje: string;
  resultado: ResultadoLector | null;
  horaMarcacion: string;
  lectorNoDisponible: boolean;
  pausado: boolean;
}) {
  const noReconocida = mensaje.startsWith("Huella no reconocida.");
  return (
    <section
      className={
        "panel lector-captura" + (noReconocida ? " huella-no-reconocida" : "")
      }
      aria-labelledby="captura-titulo"
    >
      <div className="lector-modos" role="group" aria-label="Tipo de marcación" title={estado}>
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
      <p>
        {pausado
          ? "El lector está en pausa."
          : noReconocida
            ? "Retira el dedo y vuelve a intentarlo."
            : lectorNoDisponible
              ? "La marcación por huella estará disponible cuando se conecte el lector."
              : resultado
                ? "Retira tu dedo del lector para finalizar."
                : "Apoya el dedo registrado y espera la confirmación en pantalla."}
      </p>
      <div className="lector-aviso" aria-live="polite">
        {mensaje ? (
          <div className="lector-error" role="alert">
            {mensaje}
          </div>
        ) : resultado ? (
          resultado.registrada ? (
            <div className="lector-exito" role="status">
              <CheckCircle2 size={17} /> {resultado.tipo} · {horaMarcacion}
            </div>
          ) : (
            <div className="lector-informacion" role="status">
              <Info size={17} /> {resultado.mensaje}
            </div>
          )
        ) : (
          <div className="lector-ayuda">
            <ShieldCheck size={16} /> La lectura se realiza automáticamente
          </div>
        )}
      </div>
    </section>
  );
}
