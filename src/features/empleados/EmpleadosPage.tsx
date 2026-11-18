import { useCallback, useState } from "react";
import { CalendarDays, Pencil, Trash2, Users } from "lucide-react";
import { mensajeError } from "../../shared/api/http";
import { useConsulta } from "../../shared/hooks/useConsulta";
import { useConfirmacion } from "../../shared/ui/Confirmacion";
import { ToastError } from "../../shared/ui/ToastError";
import { ErrorVista } from "../../shared/ui/Pagina";
import { Listado, type Columna } from "../../shared/ui/Listado";
import { BotonNuevo } from "../../shared/ui/Controls";
import { FiltroEstado, type FiltroEstadoValor } from "../../shared/ui/FiltroEstado";
import { listarAreas } from "../areas/api";
import { listarTurnos } from "../turnos/api";
import { eliminarEmpleado, listarEmpleados, type Empleado } from "./api";
import { EmpleadoForm } from "./EmpleadoForm";
import HorarioSemanal from "./HorarioSemanal";
import "./empleados.css";

const columnas: Columna<Empleado>[] = [
  ["nombres", "Nombres"],
  ["apellidos", "Apellidos"],
  ["dni", "DNI"],
  ["area", "Área"],
];

export function EmpleadosPage({
  protegerSalida,
}: {
  protegerSalida: (verificar: (() => Promise<boolean>) | null) => void;
}) {
  const empleados = useConsulta(listarEmpleados);
  const areas = useConsulta(listarAreas);
  const turnos = useConsulta(listarTurnos);
  const [estado, setEstado] = useState<FiltroEstadoValor>("ACTIVO");
  const [ficha, setFicha] = useState<{ empleado?: Empleado }>();
  const [versionFicha, setVersionFicha] = useState(0);
  const [horario, setHorario] = useState<Empleado>();
  const [eliminando, setEliminando] = useState(false);
  const [errorEliminacion, setErrorEliminacion] = useState("");
  const cerrarToast = useCallback(() => setErrorEliminacion(""), []);
  const confirmar = useConfirmacion();
  const opcionesCargando = areas.cargando || turnos.cargando;
  const opcionesDisponibles = !!areas.datos && !!turnos.datos;

  async function quitar(empleado: Empleado) {
    if (eliminando || !(await confirmar({ titulo: "Eliminar empleado", mensaje: `¿Deseas eliminar a ${empleado.nombres} ${empleado.apellidos}? Esta acción no se puede deshacer.`, confirmar: "Eliminar", peligro: true }))) return;
    setEliminando(true);
    setErrorEliminacion("");
    try {
      await eliminarEmpleado(empleado.id);
      empleados.recargar();
    } catch (error) {
      setErrorEliminacion(mensajeError(error));
    } finally {
      setEliminando(false);
    }
  }

  return (
    <>
      <ToastError mensaje={errorEliminacion} cerrar={cerrarToast} />
      <ErrorVista mensaje={empleados.error || areas.error || turnos.error} />
      <div hidden={!!ficha}>
        <Listado
          titulo="Listado de empleados"
          icono={Users}
          columnas={columnas}
          filas={(empleados.datos ?? []).filter((empleado) => empleado.estado === estado)}
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
              <button
                type="button"
                className="icon-button delete"
                aria-label={`Eliminar ${empleado.nombres} ${empleado.apellidos}`}
                title="Eliminar empleado"
                disabled={eliminando}
                onClick={() => void quitar(empleado)}
              >
                <Trash2 size={16} />
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
            key={versionFicha}
            empleado={ficha.empleado}
            areas={areas.datos ?? []}
            turnos={turnos.datos ?? []}
            protegerSalida={protegerSalida}
            alCerrar={() => setFicha(undefined)}
            alGuardar={empleados.recargar}
            alNuevo={() => { setFicha({}); setVersionFicha((version) => version + 1); }}
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
