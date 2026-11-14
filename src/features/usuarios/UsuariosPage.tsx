import { UserRound } from "lucide-react";
import { listarEmpleados } from "../empleados/api";
import { useConsulta } from "../../shared/hooks/useConsulta";
import { Field, Select } from "../../shared/ui/Controls";
import {
  CampoEstado,
  campo,
  estadoRegistro,
  idOpcional,
} from "../../shared/ui/camposRegistro";
import { RegistroCatalogo } from "../../shared/ui/RegistroCatalogo";
import { ErrorVista } from "../../shared/ui/Pagina";
import TextInput from "../../shared/ui/TextInput";
import { guardarUsuario, listarUsuarios } from "./api";

export function UsuariosPage() {
  const empleados = useConsulta(listarEmpleados);
  if (!empleados.datos) {
    return (
      <>
        {empleados.cargando && <p role="status">Cargando empleados...</p>}
        <ErrorVista mensaje={empleados.error} />
      </>
    );
  }
  return (
    <>
      <ErrorVista mensaje={empleados.error} />
      <RegistroCatalogo
        titulo="Usuarios"
        singular="usuario"
        descripcion="Administra los accesos al sistema."
        icono={UserRound}
        listar={listarUsuarios}
        columnas={[
          ["usuario", "Usuario"],
          ["nombre", "Empleado"],
          ["rol", "Rol"],
          ["estado", "Estado"],
        ]}
        guardar={(id, datos) =>
          guardarUsuario(id, {
            usuarioAlias: campo(datos, "usuarioAlias"),
            clave: campo(datos, "clave"),
            personalId: idOpcional(datos, "personalId"),
            rol: campo(datos, "rol") === "ADMIN" ? "ADMIN" : "EMPLEADO",
            estado: estadoRegistro(datos),
          })
        }
        campos={(usuario) => (
          <>
            <Field label="Usuario">
              <TextInput
                name="usuarioAlias"
                defaultValue={usuario?.usuario}
                required
              />
            </Field>
            <Field label="Empleado">
              <Select
                name="personalId"
                defaultValue={usuario?.personalId ?? ""}
              >
                <option value="">Sin asignar</option>
                {empleados.datos?.map(({ id, nombres, apellidos }) => (
                  <option key={id} value={id}>
                    {nombres} {apellidos}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Rol">
              <Select name="rol" defaultValue={usuario?.rol ?? "EMPLEADO"}>
                <option>ADMIN</option>
                <option>EMPLEADO</option>
              </Select>
            </Field>
            <CampoEstado estado={usuario?.estado} />
            <Field label="Contraseña">
              <TextInput
                name="clave"
                type="password"
                required={!usuario}
                minLength={6}
                placeholder={usuario ? "Dejar vacío para conservar" : ""}
              />
            </Field>
          </>
        )}
      />
    </>
  );
}
