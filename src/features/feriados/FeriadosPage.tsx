import { CalendarDays } from "lucide-react";
import { Field } from "../../shared/ui/Controls";
import { campo } from "../../shared/ui/camposRegistro";
import { RegistroCatalogo } from "../../shared/ui/RegistroCatalogo";
import TextInput from "../../shared/ui/TextInput";
import { eliminarFeriado, guardarFeriado, listarFeriados } from "./api";

export function FeriadosPage() {
  return (
    <RegistroCatalogo
      titulo="Feriados"
      singular="feriado"
      descripcion="Mantén actualizado el calendario de días feriados."
      icono={CalendarDays}
      listar={listarFeriados}
      eliminar={eliminarFeriado}
      columnas={[
        ["nombre", "Nombre"],
        ["fecha", "Fecha"],
      ]}
      guardar={(id, datos) =>
        guardarFeriado(id, {
          nombre: campo(datos, "nombre"),
          fecha: campo(datos, "fecha"),
        })
      }
      campos={(feriado) => (
        <>
          <Field label="Nombre del feriado">
            <TextInput name="nombre" defaultValue={feriado?.nombre} required />
          </Field>
          <Field label="Fecha">
            <TextInput
              name="fecha"
              type="date"
              defaultValue={feriado?.fecha}
              required
            />
          </Field>
        </>
      )}
    />
  );
}
