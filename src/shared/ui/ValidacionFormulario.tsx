import { useEffect, useState, type ReactNode } from "react";
import { Toast } from "./Toast";

type Campo = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

export function enfocarCampo(campo: Element | null) {
  if (!(campo instanceof HTMLElement)) return;
  campo.focus({ preventScroll: true });
  campo.scrollIntoView({ block: "center", behavior: "smooth" });
}

export class ErrorCampo extends Error {
  constructor(mensaje: string, readonly campo: string) { super(mensaje); }
}

function mensajeValidacion(campo: Campo) {
  const nombre = campo.labels?.[0]?.querySelector(":scope > span")?.textContent?.trim() || campo.getAttribute("aria-label") || "este campo";
  if (campo.validity.valueMissing) return campo instanceof HTMLSelectElement ? `Selecciona una opción en ${nombre}.` : `Completa el campo ${nombre}.`;
  if (campo.validity.patternMismatch && campo.title) return campo.title;
  return `${nombre}: ${campo.validationMessage}`;
}

export function ValidacionFormulario({ children }: { children: ReactNode }) {
  const [aviso, setAviso] = useState<{ mensaje: string; id: number } | null>(null);

  useEffect(() => {
    function validar(evento: Event) {
      const campo = evento.target;
      if (!(campo instanceof HTMLInputElement || campo instanceof HTMLSelectElement || campo instanceof HTMLTextAreaElement)) return;
      evento.preventDefault();
      const primero = Array.from(campo.form?.elements ?? []).find((elemento) =>
        (elemento instanceof HTMLInputElement || elemento instanceof HTMLSelectElement || elemento instanceof HTMLTextAreaElement) && elemento.willValidate && !elemento.validity.valid,
      );
      if (primero !== campo) return;
      enfocarCampo(campo);
      setAviso((anterior) => ({ mensaje: mensajeValidacion(campo), id: (anterior?.id ?? 0) + 1 }));
    }
    document.addEventListener("invalid", validar, true);
    return () => document.removeEventListener("invalid", validar, true);
  }, []);

  useEffect(() => {
    function navegar(evento: KeyboardEvent) {
      if (evento.defaultPrevented || evento.isComposing || evento.altKey || evento.ctrlKey || evento.metaKey || evento.shiftKey) return;
      const campo = evento.target;
      if (!(campo instanceof HTMLInputElement || campo instanceof HTMLSelectElement || campo instanceof HTMLTextAreaElement) || !campo.form) return;
      if (campo instanceof HTMLTextAreaElement) return;
      const enter = evento.key === "Enter";
      const flecha = evento.key === "ArrowDown" || evento.key === "ArrowUp";
      if (!enter && !flecha) return;
      if (flecha && (campo instanceof HTMLSelectElement || ["number", "date", "time", "month", "week", "datetime-local", "range"].includes(campo.type))) return;
      const campos = Array.from(campo.form.elements).filter((elemento): elemento is Campo =>
        (elemento instanceof HTMLInputElement || elemento instanceof HTMLSelectElement || elemento instanceof HTMLTextAreaElement) &&
        !elemento.disabled && !("readOnly" in elemento && elemento.readOnly) && elemento.tabIndex >= 0 &&
        !(elemento instanceof HTMLInputElement && ["hidden", "file", "checkbox", "radio", "submit", "button", "reset"].includes(elemento.type)) &&
        elemento.getClientRects().length > 0,
      );
      const indice = campos.indexOf(campo);
      const siguiente = campos[indice + (evento.key === "ArrowUp" ? -1 : 1)];
      if (indice < 0 || !siguiente) return;
      evento.preventDefault();
      siguiente.focus({ preventScroll: true });
      siguiente.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
    document.addEventListener("keydown", navegar);
    return () => document.removeEventListener("keydown", navegar);
  }, []);

  return <>{children}{aviso && <Toast key={aviso.id} mensaje={aviso.mensaje} cerrar={() => setAviso(null)} />}</>;
}
