import { useState } from "react";
import { CalendarDays, Pencil, Users } from "lucide-react";
import { useConsulta } from "../../shared/hooks/useConsulta";
import { ErrorVista } from "../../shared/ui/Pagina";
import { Listado, type Columna } from "../../shared/ui/Listado";
import { BotonNuevo } from "../../shared/ui/Controls";
import { FiltroEstado, type FiltroEstadoValor } from "../../shared/ui/FiltroEstado";
import { listarAreas } from "../areas/api";
import { listarTurnos } from "../turnos/api";
import { listarEmpleados, type Empleado } from "./api";
import { EmpleadoForm } from "./EmpleadoForm";
import HorarioSemanal from "./HorarioSemanal";
import "./empleados.css";

const columnas: Columna<Empleado>[] = [
  ["nombres", "Nombres"],
  ["apellidos", "Apellidos"],
  ["dni", "DNI"],
  ["area", "Área"],
  ["estado", "Estado"],
];

export function EmpleadosPage({
  protegerSalida,
}: {
  protegerSalida: (verificar: (() => Promise<boolean>) | null) => void;
}) {
  const empleados = useConsulta(listarEmpleados);
  const areas = useConsulta(listarAreas);
  const turnos = useConsulta(listarTurnos);
  const [estado, setEstado] = useState<FiltroEstadoValor>("");
  const [ficha, setFicha] = useState<{ empleado?: Empleado }>();
  const [horario, setHorario] = useState<Empleado>();
  const opcionesCargando = areas.cargando || turnos.cargando;
  const opcionesDisponibles = !!areas.datos && !!turnos.datos;

  return (
    <>
      <ErrorVista mensaje={empleados.error || areas.error || turnos.error} />
      <div hidden={!!ficha}>
        <Listado
          titulo="Listado de empleados"
          icono={Users}
          columnas={columnas}
          filas={(empleados.datos ?? []).filter((empleado) => !estado || empleado.estado === estado)}
          filtros={<FiltroEstado value={estado} onChange={setEstado} />}
          resetPageOn={estado}
          cargando={empleados.cargando}
          accionCabecera={
            <BotonNuevo
              type="button"
              nombre="empleado"
              disabled={!opcionesDisponibles || opcionesCargando}
              onClick={() => setFicha({})}
            />
          }
          acciones={(empleado) => (
            <>
              <button
                type="button"
                className="icon-button"
                aria-label="Asignar horario"
                title="Asignar horario semanal"
                disabled={!opcionesDisponibles || opcionesCargando}
                onClick={() => setHorario(empleado)}
              >
                <CalendarDays size={16} />
              </button>
              <button
                type="button"
                className="icon-button"
                aria-label="Editar"
                disabled={!opcionesDisponibles}
                onClick={() => setFicha({ empleado })}
              >
                <Pencil size={16} />
              </button>
            </>
          )}
        />
      </div>
      {ficha &&
        (opcionesCargando ? (
          <p role="status">Cargando el formulario...</p>
        ) : (
          <EmpleadoForm
            empleado={ficha.empleado}
            areas={areas.datos ?? []}
            turnos={turnos.datos ?? []}
            protegerSalida={protegerSalida}
            alCerrar={() => setFicha(undefined)}
            alGuardar={empleados.recargar}
          />
        ))}
      {horario && (
        <HorarioSemanal
          empleado={horario}
          turnos={turnos.datos ?? []}
          onClose={() => {
            setHorario(undefined);
            turnos.recargar();
          }}
        />
      )}
    </>
  );
}
