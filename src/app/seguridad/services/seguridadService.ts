import { cambiar, consultar } from "../../../shared/api/http";

export type Indicador = { codigo: string; nombre: string; permiteCrear: boolean; permiteEditar: boolean; permiteEliminar: boolean; permitido: boolean; crear: boolean; editar: boolean; eliminar: boolean };
export type Fila = { codigo: string; nombre: string; permiteCrear: boolean; permiteEditar: boolean; permiteEliminar: boolean; permitido: boolean | null; editar: boolean | null; crear: boolean | null; eliminar: boolean | null; efectivoPermitido: boolean; efectivoEditar: boolean; efectivoCrear: boolean; efectivoEliminar: boolean };
export type Usuario = { id: number; usuario: string; personal: string; area: string | null };

export const listarUsuariosSeguridad = (signal: AbortSignal) => consultar<Usuario[]>("seguridad/usuarios", { signal });
export const consultarPermisosArea = (area: string, signal: AbortSignal) => consultar<Indicador[]>(`seguridad/areas/${area}/permisos`, { signal });
export const guardarPermisosArea = (area: string, matriz: Indicador[]) => cambiar(`seguridad/areas/${area}/permisos`, "PUT", { permisos: matriz.map(({ codigo, permitido, crear, editar, eliminar }) => ({ codigo, permitido, crear, editar, eliminar })) });
export const consultarPermisosUsuario = (usuario: string, signal: AbortSignal) => consultar<Fila[]>(`seguridad/usuarios/${usuario}/permisos`, { signal });
export const guardarPermisosUsuario = (usuario: string, matriz: Fila[]) => cambiar(`seguridad/usuarios/${usuario}/permisos`, "PUT", { permisos: matriz.map(({ codigo, permitido, editar, crear, eliminar }) => ({ codigo, permitido, editar, crear, eliminar })) });
