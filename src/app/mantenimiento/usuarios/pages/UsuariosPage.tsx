import { useId, useState } from "react";
import { FiltroEstado, type FiltroEstadoValor } from "../../../../components/FiltroEstado";
import { UserRound } from "lucide-react";
import { listarPersonalParaUsuarios } from "../../empleados/services/empleadosService";
import { useConsulta } from "../../../../shared/hooks/useConsulta";
import { Field } from "../../../../components/Controls";
import { Autocomplete } from "../../../../components/Autocomplete";
import {
  CampoEstado,
  campo,
  estadoRegistro,
  idOpcional,
} from "../../../../components/camposRegistro";
import { RegistroCatalogo } from "../../../../components/RegistroCatalogo";
import { ErrorVista } from "../../../../components/Pagina";
import TextInput from "../../../../components/TextInput";
import PasswordInput from "../../../../components/PasswordInput";
import { ErrorCampo } from "../../../../components/ValidacionFormulario";
import { eliminarUsuario, guardarUsuario, listarUsuarios } from "../services/usuariosService";
import "../usuarios.css";

export function UsuariosPage({ volver }: { volver: () => void }) {
  const empleados = useConsulta(listarPersonalParaUsuarios);
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
        modulo="usuarios"
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
            {usuario?.personalId && <TextInput type="hidden" name="personalId" value={usuario.personalId} readOnly />}
            <Field label="Personal">
              <Autocomplete
                name="personalId"
                defaultValue={usuario?.personalId ?? ""}
                required
                disabled={!!usuario?.personalId}
                placeholder="Buscar personal"
                opciones={(empleados.datos ?? []).map(({ id, nombres, apellidos }) => ({ value: String(id), label: `${nombres} ${apellidos}`.trim() }))}
              />
            </Field>
            <Field label="Usuario / Alias">
              <TextInput name={aliasId} defaultValue={usuario?.usuario} placeholder="Ej: jramirez" required onChange={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/\s+/g, ""); }} />
            </Field>
            <Field label="Contraseña">
              <PasswordInput name={claveId} evitarSugerencias required={!usuario} minLength={6} placeholder={usuario ? "Dejar vacío para conservar" : "Ingrese contraseña"} />
            </Field>
            <Field label="Confirmar contraseña">
              <PasswordInput name={confirmarClaveId} evitarSugerencias required={!usuario} placeholder="Repita la contraseña" />
            </Field>
            <CampoEstado estado={usuario?.estado} editable={!!usuario} />
          </div>
        )}
      />
    </>
  );
}
