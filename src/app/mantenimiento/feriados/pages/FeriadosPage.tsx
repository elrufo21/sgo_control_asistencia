import { CalendarDays } from "lucide-react";
import { Field } from "../../../../components/Controls";
import { campo } from "../../../../components/camposRegistro";
import { RegistroCatalogo } from "../../../../components/RegistroCatalogo";
import TextInput from "../../../../components/TextInput";
import { eliminarFeriado, guardarFeriado, listarFeriados } from "../services/feriadosService";

export function FeriadosPage({ volver }: { volver: () => void }) {
  return (
    <RegistroCatalogo
      modulo="feriados"
      dialogoDxn
      volver={volver}
      titulo="Feriados"
      singular="feriado"
      descripcion="Mantén actualizado el calendario de días feriados."
      icono={CalendarDays}
      listar={listarFeriados}
      eliminar={eliminarFeriado}
      columnas={[
        ["fecha", "Fecha"],
        ["nombre", "Motivo"],
      ]}
      guardar={(id, datos) =>
        guardarFeriado(id, {
          nombre: campo(datos, "nombre"),
          fecha: campo(datos, "fecha"),
        })
      }
      campos={(feriado) => (
        <>
          <div className="dialog-dxn-fecha"><Field label="Fecha">
            <TextInput
              name="fecha"
              type="date"
              defaultValue={feriado?.fecha ?? new Date().toLocaleDateString("sv-SE")}
              required
            />
          </Field></div>
          <Field label="Motivo">
            <TextInput name="nombre" defaultValue={feriado?.nombre} placeholder="Motivo del feriado" required />
          </Field>
        </>
      )}
    />
  );
}
