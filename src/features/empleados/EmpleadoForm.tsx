import { useCallback, useEffect, useId, useState, type FormEvent } from "react";
import { ArrowLeft, Plus, Save, Search, Trash2 } from "lucide-react";
import type { Area } from "../areas/api";
import type { Turno } from "../turnos/api";
import { consultar, mensajeError } from "../../shared/api/http";
import { ErrorVista } from "../../shared/ui/Pagina";
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
import { formatoFecha } from "../../shared/formatoFecha";

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
  alNuevo,
  protegerSalida,
}: {
  empleado?: Empleado;
  areas: Area[];
  turnos: Turno[];
  alCerrar: () => void;
  alGuardar: () => void;
  alNuevo: () => void;
  protegerSalida: (verificar: (() => Promise<boolean>) | null) => void;
}) {
  const campoId = useId().replace(/[^a-zA-Z0-9]/g, "");
  const nombreCampo = (indice: number) => `registro_${campoId}_${indice}`;
  const [consultaDni, setConsultaDni] = useState("");
  const [consultandoDni, setConsultandoDni] = useState(false);
  const [nombres, setNombres] = useState(empleado?.nombres ?? "");
  const [apellidos, setApellidos] = useState(empleado?.apellidos ?? "");
  const [dni, setDni] = useState(empleado?.dni ?? "");
  const [nacimiento, setNacimiento] = useState(empleado?.nacimiento?.slice(0, 10) ?? "");
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

  async function nuevo() {
    if (!guardando && !consultandoDni && (!editado || await confirmar({ titulo: "Cambios sin guardar", mensaje: "Al crear una ficha nueva perderás los cambios realizados.", confirmar: "Crear ficha nueva" }))) alNuevo();
  }

  async function guardar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (guardando) return;
    const datos = new FormData(evento.currentTarget);
    setGuardando(true);
    setError("");
    try {
      await guardarEmpleado(empleado?.id, {
        nombres: campo(datos, nombreCampo(1)),
        apellidos: campo(datos, nombreCampo(2)),
        dni: campo(datos, nombreCampo(3)),
        nacimiento: campo(datos, "nacimiento"),
        direccion: campo(datos, nombreCampo(4)),
        areaId: idOpcional(datos, "areaId"),
        turnoId: idOpcional(datos, "turnoId"),
        telefono: campo(datos, nombreCampo(5)),
        email: campo(datos, nombreCampo(6)),
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

  async function buscarDni() {
    if (!/^\d{8}$/.test(consultaDni)) { setError("Ingresa los 8 dígitos del DNI."); return; }
    setConsultandoDni(true); setError("");
    try {
      const resultado = await consultar<{ dni: string; nombres: string; apellidos: string }>(`empleados/consulta-dni/${consultaDni}`);
      setDni(resultado.dni);
      if (resultado.nombres) setNombres(resultado.nombres);
      if (resultado.apellidos) setApellidos(resultado.apellidos);
      setEditado(true);
    } catch (error) { setError(mensajeError(error)); }
    finally { setConsultandoDni(false); }
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

  const edad = (() => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(nacimiento)) return "";
    const [year, month, day] = nacimiento.split("-").map(Number);
    const hoy = new Date();
    let valor = hoy.getFullYear() - year;
    if (hoy.getMonth() + 1 < month || (hoy.getMonth() + 1 === month && hoy.getDate() < day)) valor--;
    return valor >= 0 ? `${valor} años` : "";
  })();
  const ingreso = empleado ? formatoFecha(empleado.ingreso ?? null) : formatoFecha(new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Lima", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()));

  return (
    <section className="panel empleado-formulario" aria-labelledby="empleado-form-title">
      <ToastError mensaje={errorEliminacion} cerrar={cerrarToast} />
      <form autoComplete="off" onSubmit={guardar} onChange={() => setEditado(true)}>
        <div className="empleado-form-head">
          <div className="empleado-form-titulo">
            <Button type="button" variant="secondary" disabled={guardando} onClick={cancelar} aria-label="Volver a empleados"><ArrowLeft size={16} /></Button>
            <h1 id="empleado-form-title">{empleado ? "Editar personal" : "Registrar personal"}</h1>
          </div>
          <div className="empleado-form-acciones">
            {empleado && <Button type="button" variant="secondary" disabled={guardando} onClick={eliminar}><Trash2 size={16} /> Eliminar</Button>}
            <Button type="button" variant="secondary" className="empleado-boton-nuevo" disabled={guardando || consultandoDni} onClick={() => void nuevo()}><Plus size={16} /> Nuevo</Button>
            <Button type="submit" disabled={guardando}><Save size={16} /> {guardando ? "Guardando..." : "Guardar"}</Button>
          </div>
        </div>
        <div className="empleado-form-layout">
          <div className="form-grid empleado-datos">
            <Field label="Área"><Select name="areaId" required defaultValue={empleado?.areaId ?? ""}><option value="">Seleccione área</option>{areas.map(({ id, nombre }) => <option key={id} value={id}>{nombre}</option>)}</Select></Field>
            <div className="empleado-consulta-dni"><Field label="Consultar DNI"><TextInput autoComplete="one-time-code" value={consultaDni} inputMode="numeric" maxLength={8} onChange={(e) => setConsultaDni(e.currentTarget.value.replace(/\D/g, ""))} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); void buscarDni(); } }} /></Field><Button type="button" disabled={consultandoDni} onClick={() => void buscarDni()} aria-label="Consultar DNI"><Search size={16} /></Button></div>
            <Field label="Nombres"><TextInput name={nombreCampo(1)} autoComplete="one-time-code" value={nombres} onChange={(e) => setNombres(e.currentTarget.value)} required maxLength={140} /></Field>
            <Field label="Apellidos"><TextInput name={nombreCampo(2)} autoComplete="one-time-code" value={apellidos} onChange={(e) => setApellidos(e.currentTarget.value)} required maxLength={140} /></Field>
            <Field label="DNI"><TextInput name={nombreCampo(3)} autoComplete="one-time-code" value={dni} onChange={(e) => setDni(e.currentTarget.value)} required maxLength={20} /></Field>
            <Field label="Teléfono"><TextInput name={nombreCampo(5)} autoComplete="one-time-code" defaultValue={empleado?.telefono ?? ""} maxLength={40} /></Field>
            <Field label="Fecha de nacimiento"><TextInput name="nacimiento" type="date" value={nacimiento} onChange={(e) => setNacimiento(e.currentTarget.value)} /></Field>
            <Field label="Edad"><TextInput value={edad} readOnly disabled /></Field>
            <Field label="Dirección"><TextInput name={nombreCampo(4)} autoComplete="one-time-code" defaultValue={empleado?.direccion ?? ""} maxLength={140} /></Field>
            <Field label="Correo"><TextInput name={nombreCampo(6)} autoComplete="one-time-code" type="email" defaultValue={empleado?.email ?? ""} maxLength={100} /></Field>
            <Field label={empleado ? "Fecha y hora de ingreso" : "Fecha de ingreso"}><TextInput value={ingreso} readOnly /></Field>
            <CampoEstado estado={empleado?.estado} />
            <Field label="Turno sugerido para horario"><Select name="turnoId" defaultValue={empleado?.turnoId ?? ""}><option value="">Sin asignar</option>{turnos.map(({ id, nombre }) => <option key={id} value={id}>{nombre}</option>)}</Select></Field>
          </div>
          <FotoEmpleado empleado={empleado ?? {}} foto={foto} setFoto={(valor) => { setFoto(valor); setEditado(true); }} eliminar={eliminarFoto} setEliminar={setEliminarFoto} setError={setError} onHuellaRegistrada={alGuardar} />
        </div>
        <ErrorVista mensaje={error} className="dialog-error" />
      </form>
    </section>
  );
}
