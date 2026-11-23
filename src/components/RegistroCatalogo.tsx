import { useCallback, useState, type FormEvent, type ReactNode } from "react";
import { Pencil, Trash2, X, type LucideIcon } from "lucide-react";
import { mensajeError } from "../shared/api/http";
import { useConsulta } from "../shared/hooks/useConsulta";
import { Listado, type Columna } from "./Listado";
import { AccionesFormulario, ErrorVista } from "./Pagina";
import { BotonNuevo, Button } from "./Controls";
import { useConfirmacion } from "./Confirmacion";
import { ToastError } from "./ToastError";
import { enfocarCampo, ErrorCampo } from "./ValidacionFormulario";
import { usePermisos } from "../shared/security/permisos";

export function RegistroCatalogo<Fila extends { id: number }>({
  titulo,
  singular,
  icono,
  columnas,
  listar,
  guardar,
  eliminar,
  campos,
  filtros,
  filtrar,
  resetPageOn,
  volver,
  modulo,
  dialogoDxn = false,
}: {
  titulo: string;
  singular: string;
  descripcion: string;
  icono: LucideIcon;
  columnas: readonly Columna<Fila>[];
  listar: (signal: AbortSignal) => Promise<Fila[]>;
  guardar: (id: number | undefined, datos: FormData) => Promise<void>;
  eliminar?: (id: number) => Promise<void>;
  campos: (fila: Fila | undefined) => ReactNode;
  filtros?: ReactNode;
  filtrar?: (fila: Fila) => boolean;
  resetPageOn?: unknown;
  volver: () => void;
  modulo: string;
  dialogoDxn?: boolean;
}) {
  const permisos = usePermisos(modulo);
  const { datos, cargando, error, recargar } = useConsulta(listar);
  const [edicion, setEdicion] = useState<{ fila?: Fila }>();
  const [operacion, setOperacion] = useState(false);
  const [errorOperacion, setErrorOperacion] = useState("");
  const [errorEliminacion, setErrorEliminacion] = useState("");
  const cerrarToast = useCallback(() => setErrorEliminacion(""), []);
  const confirmar = useConfirmacion();

  function abrir(fila?: Fila) {
    if (operacion) return;
    setErrorOperacion("");
    setEdicion({ fila });
  }

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!edicion || operacion) return;
    const formulario = evento.currentTarget;
    setOperacion(true);
    setErrorOperacion("");
    try {
      await guardar(edicion.fila?.id, new FormData(evento.currentTarget));
      setEdicion(undefined);
      recargar();
    } catch (error) {
      setErrorOperacion(mensajeError(error));
      if (error instanceof ErrorCampo) enfocarCampo(formulario.elements.namedItem(error.campo) as Element | null);
    } finally {
      setOperacion(false);
    }
  }

  async function quitar(id: number) {
    if (
      !eliminar ||
      operacion ||
      !(await confirmar({
        titulo: `Eliminar ${singular}`,
        mensaje:
          "¿Deseas eliminar este registro? Esta acción no se puede deshacer.",
        confirmar: "Eliminar",
        peligro: true,
      }))
    )
      return;
    setOperacion(true);
    setErrorOperacion("");
    setErrorEliminacion("");
    try {
      await eliminar(id);
      setEdicion(undefined);
      recargar();
    } catch (error) {
      setErrorEliminacion(mensajeError(error));
    } finally {
      setOperacion(false);
    }
  }

  function cerrar() {
    if (operacion) return;
    setEdicion(undefined);
    setErrorOperacion("");
  }

  return (
    <>
      <ToastError mensaje={errorEliminacion} cerrar={cerrarToast} />
      <ErrorVista mensaje={error || errorOperacion} cerrar={() => setErrorOperacion("")} />
      <Listado
        mantenimiento
        volver={volver}
        tituloPagina={titulo}
        titulo={`Listado de ${titulo.toLowerCase()}`}
        icono={icono}
        filas={filtrar ? (datos ?? []).filter(filtrar) : (datos ?? [])}
        filtros={filtros}
        resetPageOn={resetPageOn}
        columnas={columnas}
        cargando={cargando}
        accionCabecera={permisos.crear ? (
          <BotonNuevo
            type="button"
            nombre={singular}
            disabled={operacion}
            onClick={() => abrir()}
          />
        ) : undefined}
        acciones={permisos.editar || (permisos.eliminar && eliminar) ? (fila) => (
          <>
            {permisos.editar && <button
              type="button"
              className="icon-button action-edit"
              aria-label="Editar"
              disabled={operacion}
              onClick={() => abrir(fila)}
            >
              <Pencil size={16} />
            </button>}
            {eliminar && permisos.eliminar && (
              <button
                type="button"
                className="icon-button action-delete"
                aria-label="Eliminar"
                disabled={operacion}
                onClick={() => quitar(fila.id)}
              >
                <Trash2 size={16} />
              </button>
            )}
          </>
        ) : undefined}
      />
      {edicion && (
        <div
          className="overlay"
          onMouseDown={(evento) => {
            if (evento.target === evento.currentTarget) cerrar();
          }}
        >
          <div
            className={`dialog${dialogoDxn ? " dialog-dxn" : ""}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
          >
            <div className="dialog-head">
              <div>
                <h2 id="dialog-title">
                  {edicion.fila ? "Editar" : dialogoDxn ? "Crear" : "Nuevo"} {singular}
                </h2>
              </div>
              {dialogoDxn && <button type="button" className="dialog-dxn-cerrar" aria-label="Cerrar" disabled={operacion} onClick={cerrar}><X size={20} /></button>}
            </div>
            <form autoComplete="off" onSubmit={enviar}>
              <div className="form-grid">{campos(edicion.fila)}</div>
              {dialogoDxn ? <div className="dialog-actions"><Button type="button" variant="secondary" onClick={cerrar} disabled={operacion}>Cancelar</Button><Button type="submit" disabled={operacion}>{operacion ? "Guardando..." : "Guardar"}</Button></div> : <AccionesFormulario
                guardando={operacion}
                cancelar={cerrar}
                eliminar={
                  permisos.eliminar && eliminar && edicion.fila
                    ? () => quitar(edicion.fila!.id)
                    : undefined
                }
              />}
            </form>
          </div>
        </div>
      )}
    </>
  );
}
