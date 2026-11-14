import { Clock3 } from "lucide-react";

import type { Jornada } from "./api";

const columnas = [
  ["ingreso", "Ingreso"],
  ["salidaRefrigerio", "Salida a refrigerio"],
  ["retornoRefrigerio", "Retorno de refrigerio"],
  ["salida", "Salida"],
] as const;
export default function TablaJornadas({
  jornada,
  identificado,
}: {
  jornada?: Jornada | null;
  identificado: boolean;
}) {
  const jornadas = jornada ? [jornada] : [];
  return (
    <section className="panel jornadas-panel" aria-label="Marcaciones de hoy">
      <div className="table-wrap">
        <table className="jornadas-tabla">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Personal</th>
              {columnas.map(([, label]) => (
                <th key={label}>{label}</th>
              ))}
              <th>Marcaciones</th>
            </tr>
          </thead>
          <tbody>
            {jornadas.map((row) => (
              <tr key={row.id}>
                <td>{row.fecha?.split("-").reverse().join("/")}</td>
                <td className="jornadas-nombre">{row.nombres}</td>
                {columnas.map(([key]) => (
                  <td key={key} className="jornadas-hora">
                    {row[key] || <span className="jornadas-pendiente">—</span>}
                  </td>
                ))}
                <td>
                  <span
                    className={
                      "jornadas-cantidad " +
                      (row.nroMarcacion >= (row.marcacionesProgramadas || 4)
                        ? "completa"
                        : "")
                    }
                  >
                    {row.nroMarcacion} / {row.marcacionesProgramadas || 4}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!jornada && (
        <div className="jornadas-vacia">
          <Clock3 size={22} />
          <strong>
            {identificado
              ? "Sin jornada registrada"
              : "Esperando identificación"}
          </strong>
          <span>
            {identificado
              ? "No se registró una marcación."
              : "Coloca tu dedo en el lector para consultar tus marcaciones."}
          </span>
        </div>
      )}
    </section>
  );
}
