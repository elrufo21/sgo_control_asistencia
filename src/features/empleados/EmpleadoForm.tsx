import { useCallback, useEffect, useState, type FormEvent } from "react";
import { ArrowLeft } from "lucide-react";
import type { Area } from "../areas/api";
import type { Turno } from "../turnos/api";
import { mensajeError } from "../../shared/api/http";
import { AccionesFormulario, ErrorVista } from "../../shared/ui/Pagina";
import { Button, Field, Select } from "../../shared/ui/Controls";
import {
  CampoEstado,
  campo,
  estadoRegistro,
  idOpcional,
} from "../../shared/ui/camposRegistro";
import TextInput from "../../shared/ui/TextInput";
import FotoEmpleado from "./FotoEmpleado";
import { eliminarEmpleado, guardarEmpleado, type Empleado } from "./api";
import { useConfirmacion } from "../../shared/ui/Confirmacion";
import { ToastError } from "../../shared/ui/ToastError";

function leerFoto(archivo: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      typeof reader.result === "string"
        ? resolve(reader.result)
        : reject(new Error("No se pudo leer la foto."));
    reader.onerror = () => reject(new Error("No se pudo leer la foto."));
    reader.readAsDataURL(archivo);
  });
}

export function EmpleadoForm({
  empleado,
  areas,
  turnos,
  alCerrar,
  alGuardar,
  protegerSalida,
}: {
  empleado?: Empleado;
  areas: Area[];
  turnos: Turno[];
  alCerrar: () => void;
  alGuardar: () => void;
  protegerSalida: (verificar: (() => Promise<boolean>) | null) => void;
}) {
  const [foto, setFoto] = useState<File | null>(null);
  const [eliminarFoto, setEliminarFoto] = useState(false);
  const [editado, setEditado] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [errorEliminacion, setErrorEliminacion] = useState("");
  const cerrarToast = useCallback(() => setErrorEliminacion(""), []);
  const confirmar = useConfirmacion();

  useEffect(() => {
    protegerSalida(
      async () =>
        !guardando &&
        (!editado || await confirmar({ titulo: "Cambios sin guardar", mensaje: "Si sales ahora, perderás los cambios realizados.", confirmar: "Salir" })),
    );
    return () => protegerSalida(null);
  }, [editado, guardando, protegerSalida, confirmar]);

  async function cancelar() {
    if (
      !guardando &&
      (!editado || await confirmar({ titulo: "Cambios sin guardar", mensaje: "Si sales ahora, perderás los cambios realizados.", confirmar: "Salir" }))
    )
      alCerrar();
  }

  async function guardar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (guardando) return;
    const datos = new FormData(evento.currentTarget);
    setGuardando(true);
    setError("");
    try {
      await guardarEmpleado(empleado?.id, {
        nombres: campo(datos, "nombres"),
        apellidos: campo(datos, "apellidos"),
        dni: campo(datos, "dni"),
        areaId: idOpcional(datos, "areaId"),
        turnoId: idOpcional(datos, "turnoId"),
        telefono: campo(datos, "telefono"),
        email: campo(datos, "email"),
        estado: estadoRegistro(datos),
        eliminarFoto,
        fotoBase64: foto ? await leerFoto(foto) : undefined,
      });
      alGuardar();
      alCerrar();
    } catch (error) {
      setError(mensajeError(error));
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar() {
    if (
      !empleado ||
      guardando ||
      !(await confirmar({ titulo: "Eliminar empleado", mensaje: "¿Deseas eliminar este empleado? Se perderán los cambios sin guardar.", confirmar: "Eliminar", peligro: true }))
    ) return;
    setGuardando(true);
    setError("");
    setErrorEliminacion("");
    try {
      await eliminarEmpleado(empleado.id);
      alGuardar();
      alCerrar();
    } catch (error) {
      setErrorEliminacion(mensajeError(error));
    } finally {
      setGuardando(false);
    }
  }

  return (
    <section
      className="panel empleado-formulario"
      aria-labelledby="empleado-form-title"
    >
      <ToastError mensaje={errorEliminacion} cerrar={cerrarToast} />
      <div className="empleado-form-head">
        <Button
          type="button"
          variant="secondary"
          disabled={guardando}
          onClick={cancelar}
        >
          <ArrowLeft size={16} /> Volver a empleados
        </Button>
        <h1 id="empleado-form-title">
          {empleado ? "Editar empleado" : "Nuevo empleado"}
        </h1>
      </div>
      <form onSubmit={guardar} onChange={() => setEditado(true)}>
        <div className="empleado-form-layout">
          <FotoEmpleado
            empleado={empleado ?? {}}
            foto={foto}
            setFoto={(valor) => {
              setFoto(valor);
              setEditado(true);
            }}
            eliminar={eliminarFoto}
            setEliminar={setEliminarFoto}
            setError={setError}
            onHuellaRegistrada={alGuardar}
          />
          <div className="form-grid">
            <Field label="Nombres">
              <TextInput
                name="nombres"
                defaultValue={empleado?.nombres}
                required
              />
            </Field>
            <Field label="Apellidos">
              <TextInput
                name="apellidos"
                defaultValue={empleado?.apellidos}
                required
              />
            </Field>
            <Field label="DNI">
              <TextInput name="dni" defaultValue={empleado?.dni} required />
            </Field>
            <Field label="Área">
              <Select name="areaId" defaultValue={empleado?.areaId ?? ""}>
                <option value="">Sin asignar</option>
                {areas.map(({ id, nombre }) => (
                  <option key={id} value={id}>
                    {nombre}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Turno sugerido para horario">
              <Select name="turnoId" defaultValue={empleado?.turnoId ?? ""}>
                <option value="">Sin asignar</option>
                {turnos.map(({ id, nombre }) => (
                  <option key={id} value={id}>
                    {nombre}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Teléfono">
              <TextInput
                name="telefono"
                defaultValue={empleado?.telefono ?? ""}
              />
            </Field>
            <Field label="Correo electrónico">
              <TextInput
                name="email"
                type="email"
                defaultValue={empleado?.email ?? ""}
              />
            </Field>
            <CampoEstado estado={empleado?.estado} />
          </div>
        </div>
        <ErrorVista mensaje={error} className="dialog-error" />
        <AccionesFormulario
          guardando={guardando}
          cancelar={cancelar}
          eliminar={empleado ? eliminar : undefined}
        />
      </form>
    </section>
  );
}
