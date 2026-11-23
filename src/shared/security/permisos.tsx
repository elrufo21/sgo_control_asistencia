import { createContext, useContext, type ReactNode } from "react";
import type { Sesion } from "../../app/auth/services/authService";

export type Accion = "ver" | "crear" | "editar" | "eliminar";
export const tienePermiso = (sesion: Sesion, modulo: string, accion: Accion = "ver") =>
  (sesion.permisos ?? []).includes(`${modulo}:${accion}`);

const Contexto = createContext<Sesion | null>(null);
export function PermisosSesion({ sesion, children }: { sesion: Sesion; children: ReactNode }) {
  return <Contexto.Provider value={sesion}>{children}</Contexto.Provider>;
}
export function usePermisos(modulo: string) {
  const sesion = useContext(Contexto);
  if (!sesion) throw new Error("No hay sesión para consultar permisos.");
  return {
    ver: tienePermiso(sesion, modulo),
    crear: tienePermiso(sesion, modulo, "crear"),
    editar: tienePermiso(sesion, modulo, "editar"),
    eliminar: tienePermiso(sesion, modulo, "eliminar"),
  };
}
