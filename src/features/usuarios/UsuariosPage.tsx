import { useId, useState } from "react";
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
import PasswordInput from "../../shared/ui/PasswordInput";
import { ErrorCampo } from "../../shared/ui/ValidacionFormulario";
import { eliminarUsuario, guardarUsuario, listarUsuarios } from "./api";
import "./usuarios.css";

export function UsuariosPage({ volver }: { volver: () => void }) {
  const empleados = useConsulta(listarEmpleados);
  const aliasId = `registro_${useId().replace(/[^a-zA-Z0-9]/g, "")}_1`;
  const claveId = `${aliasId}_2`;
  const confirmarClaveId = `${aliasId}_3`;
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
        volver={volver}
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
          const clave = campo(datos, claveId);
          if (clave && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(clave)) throw new ErrorCampo("La contraseña debe tener al menos 6 caracteres, una mayúscula, una minúscula y un número.", claveId);
          if (clave !== campo(datos, confirmarClaveId)) throw new ErrorCampo("Las contraseñas no coinciden.", confirmarClaveId);
          return guardarUsuario(id, {
            usuarioAlias: campo(datos, aliasId).replace(/\s+/g, ""),
            clave,
            personalId: idOpcional(datos, "personalId"),
            rol: campo(datos, "rol") === "ADMIN" ? "ADMIN" : "EMPLEADO",
            estado: estadoRegistro(datos),
          });
        }}
        campos={(usuario) => (
          <div className="usuario-campos">
            <TextInput type="hidden" name="rol" value={usuario?.rol ?? "EMPLEADO"} readOnly />
            {usuario && <TextInput type="hidden" name="personalId" value={usuario.personalId ?? ""} readOnly />}
            <Field label="Personal">
              <Select
                name="personalId"
                defaultValue={usuario?.personalId ?? ""}
                required={usuario?.rol !== "ADMIN"}
                disabled={!!usuario}
              >
                <option value="">{usuario?.rol === "ADMIN" ? "Sin asignar" : "Seleccione personal"}</option>
                {empleados.datos?.map(({ id, nombres, apellidos }) => (
                  <option key={id} value={id}>
                    {nombres} {apellidos}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Usuario / Alias">
              <TextInput name={aliasId} autoComplete="one-time-code" autoCorrect="off" spellCheck={false} data-lpignore="true" data-1p-ignore="true" defaultValue={usuario?.usuario} placeholder="Ej: jramirez" required onChange={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/\s+/g, ""); }} />
            </Field>
            <Field label="Contraseña">
              <PasswordInput name={claveId} required={!usuario} minLength={6} placeholder={usuario ? "Dejar vacío para conservar" : "Ingrese contraseña"} />
            </Field>
            <Field label="Confirmar contraseña">
              <PasswordInput name={confirmarClaveId} required={!usuario} placeholder="Repita la contraseña" />
            </Field>
            <CampoEstado estado={usuario?.estado} />
          </div>
        )}
      />
    </>
  );
}
