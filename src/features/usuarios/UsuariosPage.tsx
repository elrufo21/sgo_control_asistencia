import { useState } from "react";
import { FiltroEstado, type FiltroEstadoValor } from "../../shared/ui/FiltroEstado";
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
import { eliminarUsuario, guardarUsuario, listarUsuarios } from "./api";

export function UsuariosPage() {
  const empleados = useConsulta(listarEmpleados);
  const [estado, setEstado] = useState<FiltroEstadoValor>("ACTIVO");
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
        filtros={<FiltroEstado value={estado} onChange={setEstado} />}
        filtrar={(usuario) => usuario.estado === estado}
        resetPageOn={estado}
        eliminar={eliminarUsuario}
        columnas={[
          ["nombre", "Personal"],
          ["usuario", "Usuario"],
          ["area", "Área"],
          ["estado", "Estado"],
        ]}
        guardar={(id, datos) => {
          const clave = campo(datos, "clave");
          if (clave && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(clave)) throw new Error("La contraseña debe tener al menos 6 caracteres, una mayúscula, una minúscula y un número.");
          if (clave !== campo(datos, "confirmarClave")) throw new Error("Las contraseñas no coinciden.");
          return guardarUsuario(id, {
            usuarioAlias: campo(datos, "usuarioAlias").replace(/\s+/g, ""),
            clave,
            personalId: idOpcional(datos, "personalId"),
            rol: campo(datos, "rol") === "ADMIN" ? "ADMIN" : "EMPLEADO",
            estado: estadoRegistro(datos),
          });
        }}
        campos={(usuario) => (
          <>
            <Field label="Personal">
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
            <Field label="Usuario / Alias">
              <TextInput name="usuarioAlias" defaultValue={usuario?.usuario} required onChange={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/\s+/g, ""); }} />
            </Field>
            <Field label="Contraseña">
              <TextInput name="clave" type="password" required={!usuario} minLength={6} placeholder={usuario ? "Dejar vacío para conservar" : "Ingrese contraseña"} />
            </Field>
            <Field label="Confirmar contraseña">
              <TextInput name="confirmarClave" type="password" required={!usuario} placeholder="Repita la contraseña" />
            </Field>
            <Field label="Rol">
              <Select name="rol" defaultValue={usuario?.rol ?? "EMPLEADO"}>
                <option>ADMIN</option>
                <option>EMPLEADO</option>
              </Select>
            </Field>
            <CampoEstado estado={usuario?.estado} />
          </>
        )}
      />
    </>
  );
}
