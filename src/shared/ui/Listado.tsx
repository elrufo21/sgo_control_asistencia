import { useState, type ReactNode } from "react";
import { Search, type LucideIcon } from "lucide-react";
import TextInput from "./TextInput";
import "./listado.css";

export type Columna<Fila> = readonly [keyof Fila, string];

export function Listado<Fila extends { id: number }>({
  titulo,
  resumen,
  icono: Icono,
  filas,
  columnas,
  cargando,
  filtros,
  acciones,
  accionResumen,
}: {
  titulo: string;
  resumen: string;
  icono: LucideIcon;
  filas: Fila[];
  columnas: readonly Columna<Fila>[];
  cargando: boolean;
  filtros?: ReactNode;
  acciones?: (fila: Fila) => ReactNode;
  accionResumen?: ReactNode;
}) {
  const [busqueda, setBusqueda] = useState("");
  const termino = busqueda.toLowerCase();
  const resultados = filas.filter((fila) =>
    Object.values(fila).some((valor) =>
      String(valor ?? "")
        .toLowerCase()
        .includes(termino),
    ),
  );

  return (
    <>
      <div className="overview">
        <div className="overview-icon">
          <Icono size={24} />
        </div>
        <div>
          <span>{resumen}</span>
          <strong>{resultados.length}</strong>
        </div>
        {accionResumen ? (
          <div className="overview-action">{accionResumen}</div>
        ) : (
          <div className="overview-note">
            <span className="dot" /> Información del módulo
          </div>
        )}
      </div>
      <section className="panel">
        <div className="panel-head">
          <div>
            <h2>{titulo}</h2>
            <p>
              {cargando
                ? "Cargando..."
                : "Consulta, busca y administra tus registros."}
            </p>
          </div>
          <div className="search">
            <Search size={18} />
            <TextInput
              aria-label="Buscar registros"
              placeholder="Buscar..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.currentTarget.value)}
            />
          </div>
        </div>
        {filtros}
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                {columnas.map(([clave, etiqueta]) => (
                  <th key={String(clave)}>{etiqueta}</th>
                ))}
                {acciones && <th className="actions">Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {resultados.map((fila) => (
                <tr key={fila.id}>
                  {columnas.map(([clave, etiqueta]) => {
                    const valor = String(fila[clave] ?? "") || "—";
                    return (
                      <td key={String(clave)} data-label={etiqueta}>
                        {clave === "estado" ? (
                          <span
                            className={
                              valor === "INACTIVO"
                                ? "status inactive"
                                : "status"
                            }
                          >
                            {valor}
                          </span>
                        ) : (
                          valor
                        )}
                      </td>
                    );
                  })}
                  {acciones && (
                    <td className="actions" data-label="Acciones">
                      {acciones(fila)}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {!cargando && resultados.length === 0 && (
            <div className="empty">
              <div className="empty-icon">
                <Icono size={27} />
              </div>
              <strong>No hay registros para mostrar</strong>
              <span>
                {busqueda
                  ? "Intenta con otro término de búsqueda."
                  : "Los registros aparecerán aquí."}
              </span>
            </div>
          )}
        </div>
        <div className="panel-footer">
          Mostrando {resultados.length} registro
          {resultados.length === 1 ? "" : "s"}
        </div>
      </section>
    </>
  );
}
