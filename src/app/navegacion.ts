import {
  Building2,
  CalendarDays,
  ClipboardList,
  Clock3,
  Fingerprint,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";
import type { Sesion } from "./auth/services/authService";
import { tienePermiso } from "../shared/security/permisos";

export const navegacion = [
  { id: "lector", titulo: "Lector biométrico", icono: Fingerprint },
  { id: "atenciones", titulo: "Atenciones", icono: ClipboardList },
  { id: "empleados", titulo: "Empleados", icono: Users },
  { id: "usuarios", titulo: "Usuarios", icono: UserRound },
  { id: "areas", titulo: "Áreas", icono: Building2 },
  { id: "feriados", titulo: "Feriados", icono: CalendarDays },
  { id: "permisos", titulo: "Permisos por horas", icono: ClipboardList },
  { id: "turnos", titulo: "Turnos", icono: Clock3 },
  { id: "reporte", titulo: "Reporte de asistencia", icono: ClipboardList },
  { id: "seguridad", titulo: "Seguridad", icono: ShieldCheck },
] as const;

export type Pagina = (typeof navegacion)[number]["id"] | "mantenimiento";
export const paginasDe = (sesion: Sesion) => navegacion.filter(({ id }) => tienePermiso(sesion, id));
