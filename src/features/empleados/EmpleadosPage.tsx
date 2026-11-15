import { useState } from "react";
import { CalendarDays, Pencil, Plus, Users } from "lucide-react";
import { useConsulta } from "../../shared/hooks/useConsulta";
import { ErrorVista } from "../../shared/ui/Pagina";
import { Listado, type Columna } from "../../shared/ui/Listado";
import { Button } from "../../shared/ui/Controls";
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
  protegerSalida: (verificar: (() => boolean) | null) => void;
}) {
  const empleados = useConsulta(listarEmpleados);
  const areas = useConsulta(listarAreas);
  const turnos = useConsulta(listarTurnos);
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
          resumen="Total de empleados"
          icono={Users}
          columnas={columnas}
          filas={empleados.datos ?? []}
          cargando={empleados.cargando}
          accionResumen={
            <Button
              type="button"
              disabled={!opcionesDisponibles || opcionesCargando}
              onClick={() => setFicha({})}
            >
              <Plus size={18} /> Nuevo empleado
            </Button>
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
