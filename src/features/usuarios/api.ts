import {
  guardarRegistro,
  opcionesCatalogo,
  type Estado,
} from "../../shared/api/catalogo";
import type { Rol } from "../auth/api";
import { cambiar } from "../../shared/api/http";

export type Usuario = {
  id: number;
  usuario: string;
  nombre: string;
  personalId: number | null;
  rol: Rol;
  estado: Estado;
};
type DatosUsuario = {
  usuarioAlias: string;
  clave: string;
  personalId: number | null;
  rol: Rol;
  estado: Estado;
};
export const listarUsuarios = opcionesCatalogo<Usuario>("usuarios");
export const eliminarUsuario = (id: number) =>
  cambiar(`usuarios/${id}`, "DELETE");
export const guardarUsuario = (id: number | undefined, datos: DatosUsuario) =>
  guardarRegistro("usuarios", id, datos);
