import { useCallback, useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, Save, Search, Trash2 } from "lucide-react";
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
        nacimiento: campo(datos, "nacimiento"),
        direccion: campo(datos, "direccion"),
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
  const ingreso = /^\d{4}-\d{2}-\d{2}/.test(empleado?.ingreso ?? "") ? empleado!.ingreso!.slice(0, 10) : "";

  return (
    <section className="panel empleado-formulario" aria-labelledby="empleado-form-title">
      <ToastError mensaje={errorEliminacion} cerrar={cerrarToast} />
      <form onSubmit={guardar} onChange={() => setEditado(true)}>
        <div className="empleado-form-head">
          <div className="empleado-form-titulo">
            <Button type="button" variant="secondary" disabled={guardando} onClick={cancelar} aria-label="Volver a empleados"><ArrowLeft size={16} /></Button>
            <h1 id="empleado-form-title">{empleado ? "Editar personal" : "Registrar personal"}</h1>
          </div>
          <div className="empleado-form-acciones">
            {empleado && <Button type="button" variant="secondary" disabled={guardando} onClick={eliminar}><Trash2 size={16} /> Eliminar</Button>}
            <Button type="submit" disabled={guardando}><Save size={16} /> {guardando ? "Guardando..." : "Guardar"}</Button>
          </div>
        </div>
        <div className="empleado-form-layout">
          <div className="form-grid empleado-datos">
            <Field label="Área"><Select name="areaId" defaultValue={empleado?.areaId ?? ""}><option value="">Sin asignar</option>{areas.map(({ id, nombre }) => <option key={id} value={id}>{nombre}</option>)}</Select></Field>
            <div className="field"><span>Consultar DNI</span><div className="empleado-consulta-dni"><TextInput aria-label="DNI a consultar" value={consultaDni} inputMode="numeric" maxLength={8} onChange={(e) => setConsultaDni(e.currentTarget.value.replace(/\D/g, ""))} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); void buscarDni(); } }} /><Button type="button" disabled={consultandoDni} onClick={() => void buscarDni()} aria-label="Consultar DNI"><Search size={16} /></Button></div></div>
            <Field label="Nombres"><TextInput name="nombres" value={nombres} onChange={(e) => setNombres(e.currentTarget.value)} required maxLength={140} /></Field>
            <Field label="Apellidos"><TextInput name="apellidos" value={apellidos} onChange={(e) => setApellidos(e.currentTarget.value)} required maxLength={140} /></Field>
            <Field label="DNI"><TextInput name="dni" value={dni} onChange={(e) => setDni(e.currentTarget.value)} required maxLength={20} /></Field>
            <Field label="Teléfono"><TextInput name="telefono" defaultValue={empleado?.telefono ?? ""} maxLength={40} /></Field>
            <Field label="Fecha de nacimiento"><TextInput name="nacimiento" type="date" value={nacimiento} onChange={(e) => setNacimiento(e.currentTarget.value)} /></Field>
            <Field label="Edad"><TextInput value={edad} readOnly disabled /></Field>
            <Field label="Dirección"><TextInput name="direccion" defaultValue={empleado?.direccion ?? ""} maxLength={140} /></Field>
            <Field label="Correo"><TextInput name="email" type="email" defaultValue={empleado?.email ?? ""} maxLength={100} /></Field>
            <Field label="Fecha de ingreso"><TextInput type="date" value={ingreso} readOnly disabled /></Field>
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
