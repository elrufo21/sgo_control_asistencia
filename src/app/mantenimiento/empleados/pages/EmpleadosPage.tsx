import { useCallback, useState } from "react";
import { CalendarDays, Pencil, Trash2, Users } from "lucide-react";
import { mensajeError } from "../../../../shared/api/http";
import { useConsulta } from "../../../../shared/hooks/useConsulta";
import { useConfirmacion } from "../../../../components/Confirmacion";
import { ToastError } from "../../../../components/ToastError";
import { ErrorVista } from "../../../../components/Pagina";
import { Listado, type Columna } from "../../../../components/Listado";
import { BotonNuevo } from "../../../../components/Controls";
import { FiltroEstado, type FiltroEstadoValor } from "../../../../components/FiltroEstado";
import { listarAreasParaEmpleados } from "../../areas/services/areasService";
import { listarTurnosParaEmpleados } from "../../turnos/services/turnosService";
import { eliminarEmpleado, listarEmpleados, type Empleado } from "../services/empleadosService";
import { EmpleadoForm } from "../components/EmpleadoForm";
import HorarioSemanal from "../components/HorarioSemanal";
import { formatoFecha } from "../../../../shared/formatoFecha";
import { usePermisos } from "../../../../shared/security/permisos";
import "../empleados.css";

type EmpleadoFila = Empleado & { nombreCompleto: string; nacimientoMostrado: string };

const columnas: Columna<EmpleadoFila>[] = [
  ["nombreCompleto", "Nombres"],
  ["telefono", "Teléfono"],
  ["email", "Email"],
  ["nacimientoMostrado", "F. nacimiento"],
  ["dni", "DNI"],
];

export function EmpleadosPage({
  protegerSalida,
  volver,
}: {
  protegerSalida: (verificar: (() => Promise<boolean>) | null) => void;
  volver: () => void;
}) {
  const permisos = usePermisos("empleados");
  const empleados = useConsulta(listarEmpleados);
  const areas = useConsulta(listarAreasParaEmpleados);
  const turnos = useConsulta(listarTurnosParaEmpleados);
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
          mantenimiento
          volver={volver}
          tituloPagina="Empleados"
          titulo="Listado de empleados"
          icono={Users}
          columnas={columnas}
          filas={(empleados.datos ?? []).filter((empleado) => empleado.estado === estado).map((empleado) => ({ ...empleado, nombreCompleto: `${empleado.nombres ?? ""} ${empleado.apellidos ?? ""}`.trim(), nacimientoMostrado: formatoFecha(empleado.nacimiento ?? null) }))}
          filtros={<FiltroEstado value={estado} onChange={setEstado} />}
          resetPageOn={estado}
          cargando={empleados.cargando}
          accionCabecera={permisos.crear ? (
            <BotonNuevo
              type="button"
              nombre="empleado"
              disabled={!opcionesDisponibles || opcionesCargando}
              onClick={() => setFicha({})}
            />
          ) : undefined}
          acciones={permisos.editar || permisos.eliminar ? (empleado) => (
            <>
              {permisos.editar && <button
                type="button"
                className="icon-button"
                aria-label="Asignar horario"
                title="Asignar horario semanal"
                disabled={!opcionesDisponibles || opcionesCargando}
                onClick={() => setHorario(empleado)}
              >
                <CalendarDays size={16} />
              </button>}
              {permisos.editar && <button
                type="button"
                className="icon-button action-edit"
                aria-label="Editar"
                disabled={!opcionesDisponibles}
                onClick={() => setFicha({ empleado })}
              >
                <Pencil size={16} />
              </button>}
              {permisos.eliminar && <button
                type="button"
                className="icon-button action-delete"
                aria-label={`Eliminar ${empleado.nombres} ${empleado.apellidos}`}
                title="Eliminar empleado"
                disabled={eliminando}
                onClick={() => void quitar(empleado)}
              >
                <Trash2 size={16} />
              </button>}
            </>
          ) : undefined}
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
