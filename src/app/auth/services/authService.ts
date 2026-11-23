import { cambiar, consultar } from "../../../shared/api/http";

export type Rol = "ADMIN" | "EMPLEADO";
export type Sesion = {
  usuario: string;
  rol: Rol;
  personalId?: number | string | null;
  nombres?: string | null;
  apellidos?: string | null;
  areaId?: number | string | null;
  permisos: string[];
};

export function consultarSesion(signal: AbortSignal) {
  return consultar<Sesion>("session", { signal });
}

export function iniciarSesion(usuario: string, clave: string) {
  return consultar<Sesion>("login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usuario, clave }),
  });
}

export const cerrarSesion = () => cambiar("logout", "POST");
