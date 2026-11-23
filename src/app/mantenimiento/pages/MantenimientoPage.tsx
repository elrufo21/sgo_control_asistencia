import { ArrowRight, CalendarDays, Clock3, Layers, UserCheck2, Users2 } from "lucide-react";
import type { Sesion } from "../../auth/services/authService";
import { paginasDe, type Pagina } from "../../navegacion";
import "../mantenimiento.css";

const modulos = [
  { id: "empleados", titulo: "Empleados", descripcion: "Registra y controla los empleados.", icono: Users2, color: "empleados" },
  { id: "usuarios", titulo: "Usuarios", descripcion: "Registra y controla los usuarios.", icono: UserCheck2, color: "usuarios" },
  { id: "areas", titulo: "Áreas", descripcion: "Organiza las áreas de la empresa.", icono: Layers, color: "areas" },
  { id: "feriados", titulo: "Feriados", descripcion: "Administra días feriados y motivos.", icono: CalendarDays, color: "feriados" },
  { id: "turnos", titulo: "Turnos", descripcion: "Administra los turnos del personal.", icono: Clock3, color: "turnos" },
] as const;

export function MantenimientoPage({ sesion, navegar }: { sesion: Sesion; navegar: (pagina: Pagina) => void }) {
  const permitidas = new Set(paginasDe(sesion).map(({ id }) => id));
  return <div className="mantenimiento-grid">
    {modulos.filter(({ id }) => permitidas.has(id)).map(({ id, titulo, descripcion, icono: Icono, color }) => (
      <button type="button" className="mantenimiento-card" key={id} onClick={() => navegar(id)}>
        <span className={`mantenimiento-icono ${color}`}><Icono size={40} aria-hidden="true" /></span>
        <span className="mantenimiento-texto"><strong>{titulo}</strong><span>{descripcion}</span></span>
        <ArrowRight className="mantenimiento-flecha" size={16} aria-hidden="true" />
      </button>
    ))}
  </div>;
}
