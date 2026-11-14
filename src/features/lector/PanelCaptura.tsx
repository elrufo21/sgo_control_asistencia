import { CheckCircle2, Fingerprint, Info, ShieldCheck } from "lucide-react";

import type { ResultadoLector } from "./api";

export default function PanelCaptura({
  estado,
  mensaje,
  resultado,
  horaMarcacion,
}: {
  estado: string;
  mensaje: string;
  resultado: ResultadoLector | null;
  horaMarcacion: string;
}) {
  const noReconocida = mensaje.startsWith("Huella no reconocida.");
  return (
    <section
      className={
        "panel lector-captura" + (noReconocida ? " huella-no-reconocida" : "")
      }
      aria-labelledby="captura-titulo"
    >
      <div className="lector-captura-head">
        <span className="lector-seccion">LECTOR BIOMÉTRICO</span>
        <span className={"lector-indicador " + (mensaje ? "con-error" : "")}>
          <i /> {noReconocida ? "Huella no reconocida" : estado}
        </span>
      </div>
      <div className="lector-huella-visual">
        <div className="lector-huella-anillo">
          <Fingerprint size={72} strokeWidth={1.25} />
        </div>
      </div>
      <h2 id="captura-titulo">
        {noReconocida
          ? "Huella no reconocida"
          : resultado
            ? resultado.registrada
              ? "¡Marcación registrada!"
              : "Personal identificado"
            : "Coloca tu dedo en el lector"}
      </h2>
      <p>
        {noReconocida
          ? "Retira el dedo y vuelve a intentarlo."
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
