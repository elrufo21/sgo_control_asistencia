import { useState, type FormEvent, type ReactNode } from "react";
import { Pencil, Plus, Trash2, X, type LucideIcon } from "lucide-react";
import { mensajeError } from "../api/http";
import { useConsulta } from "../hooks/useConsulta";
import { Listado, type Columna } from "./Listado";
import { AccionesFormulario, ErrorVista } from "./Pagina";
import { Button } from "./Controls";

export function RegistroCatalogo<Fila extends { id: number }>({
  titulo,
  singular,
  icono,
  columnas,
  listar,
  guardar,
  eliminar,
  campos,
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
}) {
  const { datos, cargando, error, recargar } = useConsulta(listar);
  const [edicion, setEdicion] = useState<{ fila?: Fila }>();
  const [operacion, setOperacion] = useState(false);
  const [errorOperacion, setErrorOperacion] = useState("");

  function abrir(fila?: Fila) {
    if (operacion) return;
    setErrorOperacion("");
    setEdicion({ fila });
  }

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!edicion || operacion) return;
    setOperacion(true);
    setErrorOperacion("");
    try {
      await guardar(edicion.fila?.id, new FormData(evento.currentTarget));
      setEdicion(undefined);
      recargar();
    } catch (error) {
      setErrorOperacion(mensajeError(error));
    } finally {
      setOperacion(false);
    }
  }

  async function quitar(id: number) {
    if (
      !eliminar ||
      operacion ||
      !window.confirm("¿Deseas eliminar este registro?")
    )
      return;
    setOperacion(true);
    setErrorOperacion("");
    try {
      await eliminar(id);
      recargar();
    } catch (error) {
      setErrorOperacion(mensajeError(error));
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
      <ErrorVista mensaje={error || (!edicion ? errorOperacion : "")} />
      <Listado
        titulo={`Listado de ${titulo.toLowerCase()}`}
        resumen={`Total de ${titulo.toLowerCase()}`}
        icono={icono}
        filas={datos ?? []}
        columnas={columnas}
        cargando={cargando}
        accionResumen={
          <Button type="button" disabled={operacion} onClick={() => abrir()}>
            <Plus size={18} /> Nuevo {singular}
          </Button>
        }
        acciones={(fila) => (
          <>
            <button
              type="button"
              className="icon-button"
              aria-label="Editar"
              disabled={operacion}
              onClick={() => abrir(fila)}
            >
              <Pencil size={16} />
            </button>
            {eliminar && (
              <button
                type="button"
                className="icon-button delete"
                aria-label="Eliminar"
                disabled={operacion}
                onClick={() => quitar(fila.id)}
              >
                <Trash2 size={16} />
              </button>
            )}
          </>
        )}
      />
      {edicion && (
        <div
          className="overlay"
          onMouseDown={(evento) => {
            if (evento.target === evento.currentTarget) cerrar();
          }}
        >
          <div
            className="dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
          >
            <div className="dialog-head">
              <div>
                <h2 id="dialog-title">
                  {edicion.fila ? "Editar" : "Nuevo"} {singular}
                </h2>
                <p>Completa la información para continuar.</p>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={cerrar}
                disabled={operacion}
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={enviar}>
              <div className="form-grid">{campos(edicion.fila)}</div>
              <ErrorVista mensaje={errorOperacion} className="dialog-error" />
              <AccionesFormulario guardando={operacion} cancelar={cerrar} />
            </form>
          </div>
        </div>
      )}
    </>
  );
}
