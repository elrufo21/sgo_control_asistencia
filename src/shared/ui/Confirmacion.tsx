import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Button } from "./Controls";
import "./confirmacion.css";

type Opciones = { titulo: string; mensaje: string; confirmar: string; peligro?: boolean };
type Confirmar = (opciones: Opciones) => Promise<boolean>;
const Contexto = createContext<Confirmar | null>(null);

export function Confirmaciones({ children }: { children: ReactNode }) {
  const [opciones, setOpciones] = useState<Opciones | null>(null);
  const respuesta = useRef<((valor: boolean) => void) | null>(null);
  const dialogo = useRef<HTMLDialogElement>(null);

  const confirmar = useCallback<Confirmar>((datos) => {
    if (respuesta.current) return Promise.resolve(false);
    return new Promise((resolve) => {
      respuesta.current = resolve;
      setOpciones(datos);
    });
  }, []);

  function responder(valor: boolean) {
    const resolver = respuesta.current;
    respuesta.current = null;
    setOpciones(null);
    resolver?.(valor);
  }

  useEffect(() => {
    if (opciones) dialogo.current?.showModal();
  }, [opciones]);
  useEffect(() => () => { respuesta.current?.(false); respuesta.current = null; }, []);

  return (
    <Contexto.Provider value={confirmar}>
      {children}
      {opciones && createPortal(
        <dialog
          ref={dialogo}
          className="dialog confirmacion"
          aria-labelledby="confirmacion-titulo"
          aria-describedby="confirmacion-mensaje"
          onCancel={(evento) => { evento.preventDefault(); responder(false); }}
        >
          <div className="confirmacion-contenido">
            <h2 id="confirmacion-titulo">{opciones.titulo}</h2>
            <p id="confirmacion-mensaje">{opciones.mensaje}</p>
          </div>
          <div className="dialog-actions">
            <Button type="button" variant="secondary" autoFocus onClick={() => responder(false)}>Cancelar</Button>
            <Button type="button" className={opciones.peligro ? "confirmacion-peligro" : undefined} onClick={() => responder(true)}>{opciones.confirmar}</Button>
          </div>
        </dialog>, document.body,
      )}
    </Contexto.Provider>
  );
}

export function useConfirmacion() {
  const confirmar = useContext(Contexto);
  if (!confirmar) throw new Error("Falta el proveedor de confirmaciones.");
  return confirmar;
}
