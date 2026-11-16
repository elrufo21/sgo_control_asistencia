import {
  Building2,
  CalendarDays,
  ClipboardList,
  Clock3,
  Fingerprint,
  UserRound,
  Users,
} from "lucide-react";
import type { Rol } from "../features/auth/api";

export const navegacion = [
  { id: "lector", titulo: "Lector biométrico", icono: Fingerprint },
  { id: "empleados", titulo: "Empleados", icono: Users },
  { id: "usuarios", titulo: "Usuarios", icono: UserRound },
  { id: "areas", titulo: "Áreas", icono: Building2 },
  { id: "feriados", titulo: "Feriados", icono: CalendarDays },
  { id: "permisos", titulo: "Permisos por horas", icono: ClipboardList },
  { id: "turnos", titulo: "Turnos", icono: Clock3 },
  { id: "reporte", titulo: "Reporte de asistencia", icono: ClipboardList },
] as const;

export type Pagina = (typeof navegacion)[number]["id"];
export const paginasDe = (rol: Rol) =>
  navegacion.filter(({ id }) => rol === "ADMIN" || id === "lector");
